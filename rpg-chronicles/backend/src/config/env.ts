import 'dotenv/config'

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[RPG Chronicles] Variável de ambiente obrigatória ausente: ${name}. ` +
        'Copie .env.example para .env e preencha os valores.',
    )
  }
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',

  supabaseUrl: required('SUPABASE_URL', process.env.SUPABASE_URL),
  supabaseServiceRoleKey: required(
    'SUPABASE_SERVICE_ROLE_KEY',
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ),
}
