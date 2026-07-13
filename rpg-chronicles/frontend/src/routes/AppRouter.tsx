import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Login } from '@/pages/Login'
import { Cadastro } from '@/pages/Cadastro'
import { Inicio } from '@/pages/Inicio'
import { Perfil } from '@/pages/Perfil'
import { CriarPersonagem } from '@/pages/CriarPersonagem'
import { SelecionarPersonagem } from '@/pages/SelecionarPersonagem'
import { ListaCampanhas } from '@/pages/ListaCampanhas'
import { CriarCampanha } from '@/pages/CriarCampanha'
import { Lobby } from '@/pages/Lobby'
import { SalaRPG } from '@/pages/SalaRPG'
import { Configuracoes } from '@/pages/Configuracoes'
import { Admin } from '@/pages/Admin'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Protegido — requer sessão Supabase ativa */}
        <Route path="/inicio" element={<ProtectedRoute><Inicio /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/personagem/criar" element={<ProtectedRoute><CriarPersonagem /></ProtectedRoute>} />
        <Route path="/personagem/selecionar" element={<ProtectedRoute><SelecionarPersonagem /></ProtectedRoute>} />
        <Route path="/campanhas" element={<ProtectedRoute><ListaCampanhas /></ProtectedRoute>} />
        <Route path="/campanhas/criar" element={<ProtectedRoute><CriarCampanha /></ProtectedRoute>} />
        <Route path="/lobby/:campaignId" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
        <Route path="/sala/:roomId" element={<ProtectedRoute><SalaRPG /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
