import sql from 'mssql'

let pool: sql.ConnectionPool | null = null

function buildAzureConfig(): sql.config {
  // Trim whitespace from env variables (common .env.local issue)
  const server = (process.env.DB_SERVER || '').trim()
  const database = (process.env.DB_DATABASE || '').trim()
  const user = (process.env.DB_USER || '').trim()
  const password = (process.env.DB_PASSWORD || '').trim()

  if (!server || !database || !user || !password) {
    const missing = []
    if (!server) missing.push('DB_SERVER')
    if (!database) missing.push('DB_DATABASE')
    if (!user) missing.push('DB_USER')
    if (!password) missing.push('DB_PASSWORD')
    throw new Error(`Database configuration is incomplete. Missing: ${missing.join(', ')}`)
  }

  // Azure SQL username formats:
  // Option 1: Just username (e.g., "burtonguster")
  // Option 2: Username with server (e.g., "burtonguster@yourservername" without .database.windows.net)
  // If username doesn't contain @, we'll try adding the server name
  let formattedUser = user
  if (server.includes('.database.windows.net') && !user.includes('@')) {
    const serverName = server.replace('.database.windows.net', '')
    formattedUser = `${user}@${serverName}`
  }

  return {
    server,
    database,
    user: formattedUser,
    password,
    options: {
      encrypt: true,
      trustServerCertificate: false,
      enableArithAbort: true,
    },
    port: 1433,
  }
}

function buildConnectionString(): string {
  const server = (process.env.DB_SERVER || '').trim()
  const database = (process.env.DB_DATABASE || '').trim()
  const user = (process.env.DB_USER || '').trim()
  const password = (process.env.DB_PASSWORD || '').trim()

  // URL encode the password to handle special characters
  const encodedPassword = encodeURIComponent(password)
  
  // Try with username@servername format
  let formattedUser = user
  if (server.includes('.database.windows.net') && !user.includes('@')) {
    const serverName = server.replace('.database.windows.net', '')
    formattedUser = `${user}@${serverName}`
  }

  return `Server=${server};Database=${database};User Id=${formattedUser};Password=${encodedPassword};Encrypt=true;TrustServerCertificate=false;`
}

export async function getDbConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    const config = buildAzureConfig()
    const originalUser = (process.env.DB_USER || '').trim()
    
    // Try method 1: Config object with username@servername
    try {
      pool = await sql.connect(config)
      return pool
    } catch (error1) {
      const errorMessage1 = error1 instanceof Error ? error1.message : 'Unknown error'
      
      // Try method 2: Config object with username only (if we added @servername)
      if (config.user && config.user.includes('@') && !originalUser.includes('@')) {
        try {
          const fallbackConfig = { ...config, user: originalUser }
          pool = await sql.connect(fallbackConfig)
          return pool
        } catch (error2) {
          // Try method 3: Connection string format (better for special characters)
          try {
            const connectionString = buildConnectionString()
            pool = await sql.connect(connectionString)
            return pool
          } catch (error3) {
            // Try method 4: Connection string with username only
            try {
              const connectionString = buildConnectionString()
              const currentUser = config.user || connectionString.match(/User Id=([^;]+);/)?.[1] || originalUser
              const userOnlyString = connectionString.replace(
                `User Id=${currentUser};`,
                `User Id=${originalUser};`
              )
              pool = await sql.connect(userOnlyString)
              return pool
            } catch (error4) {
              // All methods failed, provide detailed error
              throw new Error(
                `Azure SQL login failed after trying 4 different connection methods.\n` +
                `Tried username formats:\n` +
                `  1. "${config.user}" (config object)\n` +
                `  2. "${originalUser}" (config object)\n` +
                `  3. Connection string with "${config.user}"\n` +
                `  4. Connection string with "${originalUser}"\n` +
                `Last error: ${error4 instanceof Error ? error4.message : 'Unknown error'}\n` +
                `Server: ${config.server}\n` +
                `Database: ${config.database}\n` +
                `Password length: ${(process.env.DB_PASSWORD || '').trim().length} chars\n` +
                `Please verify:\n` +
                `  - Password has no leading/trailing spaces in .env.local\n` +
                `  - Password special characters are correct\n` +
                `  - Username and password match exactly what you used successfully before\n` +
                `  - Server name is correct\n` +
                `  - Database name is correct\n` +
                `  - Your IP is allowed in Azure SQL firewall rules`
              )
            }
          }
        }
      } else {
        // If username already had @ or we're using original, try connection string
        try {
          const connectionString = buildConnectionString()
          pool = await sql.connect(connectionString)
          return pool
        } catch (error2) {
          throw new Error(
            `Azure SQL login failed.\n` +
            `Tried connection methods:\n` +
            `  1. Config object with "${config.user}"\n` +
            `  2. Connection string with "${config.user}"\n` +
            `Error: ${errorMessage1}\n` +
            `Server: ${config.server}\n` +
            `Database: ${config.database}\n` +
            `Password length: ${(process.env.DB_PASSWORD || '').trim().length} chars\n` +
            `Please verify credentials and firewall settings.`
          )
        }
      }
    }
  }
  return pool
}

export async function closeDbConnection(): Promise<void> {
  if (pool) {
    await pool.close()
    pool = null
  }
}