/**
 * DevSkills — Utilitário de Tratamento e Humanização de Erros
 * Traduz e humaniza mensagens de erro de APIs (Axios), Supabase e Conexão de Rede para Português (BR).
 */
export function getFriendlyErrorMessage(err: any): string {
  if (!err) return "Ocorreu um erro inesperado. Por favor, tente novamente.";

  // Tratamento de mensagens diretas do Supabase Auth ou nativas
  if (err.message && typeof err.message === 'string') {
    const msg = err.message.toLowerCase();
    if (msg.includes("invalid login credentials")) {
      return "E-mail ou senha incorretos. Por favor, verifique seus dados.";
    }
    if (msg.includes("email not confirmed")) {
      return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
    }
    if (msg.includes("user already exists")) {
      return "Este endereço de e-mail já está cadastrado na plataforma.";
    }
    if (msg.includes("password should be")) {
      return "A senha é muito fraca. Ela precisa ter no mínimo 6 caracteres.";
    }
    if (msg.includes("network")) {
      return "Erro de conexão com o servidor. Verifique sua internet.";
    }
  }

  // Tratamento de erros de chamadas HTTP do Axios
  if (err.response) {
    const status = err.response.status;
    const data = err.response.data;

    // Se o backend Spring Boot retornou uma mensagem customizada de validação
    if (data) {
      if (typeof data === 'string' && data.trim().length > 0) return data;
      if (data.message && typeof data.message === 'string') return data.message;
      if (data.error && typeof data.error === 'string') return data.error;
    }

    if (status === 401) {
      return "Sua sessão expirou ou você não está logado. Por favor, faça login.";
    }
    if (status === 403) {
      return "Você não tem permissão para realizar esta ação.";
    }
    if (status === 404) {
      return "O recurso solicitado não foi encontrado.";
    }
    if (status === 500) {
      return "Instabilidade temporária no servidor. Por favor, tente novamente em instantes.";
    }
  }

  // Erro de rede pura (sem resposta do servidor)
  if (err.request) {
    return "Não foi possível conectar ao servidor. Certifique-se de que o sistema está online.";
  }

  return err.message || "Ocorreu um erro ao processar sua solicitação.";
}
