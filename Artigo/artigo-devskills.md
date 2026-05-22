**DevSkills: Uma Plataforma Inteligente de Gestão de Competências e Mercado de Trabalho para Desenvolvedores de Software**

**Thalles Costa**<sup>1</sup>

1 Faculdade de Educação Tecnológica do Estado do Rio de Janeiro (FAETERJ-Rio)

Rio de Janeiro - RJ - Brasil

<Thalles.costa@ioc.fiocruz.br>

**Abstract.** This paper presents DevSkills, a full-stack web platform built with Java (Spring Boot 3) and React/TypeScript, designed to solve the fragmentation problem faced by software developers who need to map their competencies, discover job opportunities, and network with peers. The system integrates a RESTful API, a PostgreSQL relational database hosted on Supabase (BaaS), an automated job scraper consuming external Web Services, and intelligent algorithms for skill-based job matching and career readiness scoring. Two design patterns - Strategy and Chain of Responsibility - are applied in the security and authorization layers. The architecture follows a client-server model with JWT-based authentication using asymmetric cryptography (ES256). Functional tests validate the API endpoints and the security filter chain. The platform demonstrates a viable, scalable solution for the developer community.

**Resumo.** Este artigo apresenta o DevSkills, uma plataforma web full-stack construída com Java (Spring Boot 3) e React/TypeScript, projetada para resolver o problema de fragmentação enfrentado por desenvolvedores de software que precisam mapear suas competências, descobrir oportunidades de emprego e fazer networking com seus pares. O sistema integra uma API RESTful, um banco de dados relacional PostgreSQL hospedado no Supabase (BaaS), um scraper automatizado que consome Web Services externos e algoritmos inteligentes para matching de vagas baseado em habilidades e cálculo de prontidão de carreira. Dois padrões de projeto - Strategy e Chain of Responsibility - são aplicados nas camadas de segurança e autorização. A arquitetura segue o modelo cliente-servidor com autenticação JWT utilizando criptografia assimétrica (ES256). Testes funcionais validam os endpoints da API e a cadeia de filtros de segurança. A plataforma demonstra uma solução viável e escalável para a comunidade de desenvolvedores.

1\. Problema

O mercado de Tecnologia da Informação (TI) no Brasil cresceu 10,5% em 2023, superando a média global de 5,9%, conforme dados da Associação das Empresas de Tecnologia da Informação e Comunicação (Brasscom, 2024). Apesar desse crescimento acelerado, o setor enfrenta um déficit estimado de 530 mil profissionais qualificados até 2025 (Brasscom, 2024). Paradoxalmente, uma parte significativa dos desenvolvedores em formação não consegue ingressar no mercado de trabalho, o que evidencia um desalinhamento fundamental entre as competências adquiridas e as exigências reais da indústria.

A origem desse problema reside em três fatores interligados:

1.1. Fragmentação de Informações. Desenvolvedores em formação precisam consultar simultaneamente múltiplas plataformas - LinkedIn, GitHub, Glassdoor, Indeed, comunidades no Discord e Reddit - para construir uma visão razoável do mercado. Essa fragmentação gera sobrecarga cognitiva e dificulta a tomada de decisão estratégica sobre quais tecnologias estudar (Kaplan e Haenlein, 2019).

1.2. Ausência de Diagnóstico de Competências. Ao contrário de áreas como a medicina e o direito, que possuem taxonomias de competências bem definidas, a área de TI carece de ferramentas que permitam ao profissional mapear suas habilidades de forma estruturada e compará-las diretamente com as exigências de vagas abertas no mercado (Litecky et al., 2004).

1.3. Isolamento Profissional. Desenvolvedores que estudam de forma autodidata ou em ambientes acadêmicos frequentemente não possuem redes de contato profissional ativas. A ausência de networking dificulta o acesso a oportunidades e mentorias informais, ambos fatores críticos para a progressão na carreira (Granovetter, 1973).

2\. Solução

O DevSkills é uma plataforma web full-stack que centraliza, em um único ecossistema, as funcionalidades de mapeamento de competências, agregação inteligente de vagas de emprego, rede social profissional e sistema de mensageria direta entre desenvolvedores.

A proposta de valor do DevSkills pode ser sintetizada em quatro pilares:

**Radar de Competências:** Um painel inteligente onde o desenvolvedor cadastra suas habilidades técnicas com níveis de proficiência (Júnior, Pleno, Sênior, Especialista), recebe um Índice de Prontidão de Mercado calculado algoritmicamente e obtém recomendações dinâmicas de estudo baseadas em gaps identificados em sua stack.

**Mercado Inteligente:** Um agregador automatizado que coleta vagas de TI de Web Services públicos (RemoteOK, Arbeitnow, Jobicy, ApiBR), as persiste em banco de dados relacional e as apresenta ao desenvolvedor com um algoritmo de ranqueamento que prioriza vagas compatíveis com suas habilidades cadastradas no Radar.

**Comunidade (Timeline):** Uma rede social interna com sistema de postagens, comentários com votação, upvotes/downvotes, menções via @username com notificações automáticas e categorias temáticas (subreddits) que permite a troca de conhecimento, dúvidas e conquistas entre os membros da plataforma.

**Mensageria Direta:** Um sistema de chat peer-to-peer que permite a comunicação direta entre desenvolvedores via identificador @username, incluindo suporte a auto-mensagens (mensagens salvas).

\[INSERIR PRINT: Tela principal do Dashboard/Radar com os cards de métricas (Prontidão de Mercado, Stack Dominante, Ponto Mais Forte), o grid de competências e o painel de Insights/Vagas Compatíveis\]

3\. Arquitetura

A arquitetura do DevSkills adota o padrão Cliente-Servidor (Client-Server), um dos estilos arquiteturais mais consolidados na engenharia de software (Bass et al., 2012). O sistema é composto por três camadas principais:

3.1. Camada de Apresentação (Frontend)

O frontend foi desenvolvido utilizando React 19 com TypeScript, gerenciado pelo build tool Vite. A interface adota o paradigma de Single Page Application (SPA) com roteamento via react-router-dom. O design visual segue a estética glassmorphism com tema escuro, implementado inteiramente em CSS vanilla com variáveis customizadas (CSS Custom Properties).

3.2. Camada de Lógica de Negócio (Backend)

O backend foi construído inteiramente em Java 17 utilizando o framework Spring Boot 3.2.5. A aplicação é configurada como um OAuth2 Resource Server, validando tokens JWT emitidos pelo provedor de identidade Supabase. As dependências são gerenciadas pelo Apache Maven e incluem:

spring-boot-starter-web - Servidor HTTP embutido (Tomcat).

spring-boot-starter-data-jpa - Abstração ORM via Hibernate/JPA.

spring-boot-starter-security - Cadeia de filtros de seguranca.

spring-boot-starter-oauth2-resource-server - Validação JWT.

postgresql - Driver JDBC para PostgreSQL.

3.3. Camada de Dados (Banco de Dados)

O banco de dados é um PostgreSQL hospedado na infraestrutura cloud do Supabase (Backend-as-a-Service). O mapeamento objeto-relacional (ORM) é realizado pela JPA/Hibernate com estratégia ddl-auto: update. O modelo relacional contém as seguintes entidades principais:

Tabela 1. Entidades principais do modelo relacional do DevSkills

| **Entidade**   | **Descrição**                              | **Relacionamentos**                      |
| -------------- | ------------------------------------------ | ---------------------------------------- |
| Developer      | Perfil do desenvolvedor (UUID do Supabase) | 1:N → DeveloperSkill, Post, Message      |
| Skill          | Catálogo de habilidades técnicas           | 1:N → DeveloperSkill                     |
| DeveloperSkill | Associação Developer-Skill com nível       | N:1 → Developer, N:1 → Skill             |
| Post           | Publicação na timeline da comunidade       | N:1 → Developer, 1:N → Comment, PostVote |
| Comment        | Comentário em uma publicação               | N:1 → Post, N:1 → Developer              |
| PostVote       | Voto único por usuário em um post          | N:1 → Post, N:1 → Developer              |
| JobOffer       | Vaga de emprego (manual ou via scraper)    | N:1 → Developer, 1:N → JobOfferVote      |
| JobOfferVote   | Voto único por usuário em uma vaga         | N:1 → JobOffer, N:1 → Developer          |
| Message        | Mensagem direta entre desenvolvedores      | N:1 → Developer (sender, receiver)       |
| Notification   | Notificação do sistema                     | N:1 → Developer                          |

\[INSERIR PRINT: Diagrama de Entidade-Relacionamento (DER) do banco de dados\]

3.4. Padrões de Projeto

Dois padrões de projeto do catálogo Gang of Four (GoF) foram implementados na aplicação (Gamma et al., 1994):

3.4.1. Strategy (Comportamental)

O padrão Strategy é utilizado no gerenciamento de papéis de acesso (roles) dentro da camada de segurança. A interface RoleStrategy define o contrato com os métodos getRoleName(), canAccessDashboard() e canManageUsers(). Três estratégias concretas implementam essa interface:

AdminRoleStrategy - Acesso total ao painel e gerenciamento de usuários.

DevRoleStrategy - Acesso ao painel, sem gerenciamento de usuários.

ClientRoleStrategy - Sem acesso ao painel administrativo.

A classe UserContext atua como o Contexto do padrão, recebendo a role extraída do JWT e instanciando dinamicamente a estratégia correspondente via expressão switch do Java 17.

public class UserContext {

private RoleStrategy roleStrategy;

public UserContext(String roleFromJwt) {

this.roleStrategy = switch (roleFromJwt.toUpperCase()) {

case "ADMIN" -> new AdminRoleStrategy();

case "DEV" -> new DevRoleStrategy();

default -> new ClientRoleStrategy();

};

}

public boolean checkDashboardAccess() {

return roleStrategy.canAccessDashboard();

}

}

**Justificativa:** O padrão Strategy elimina estruturas condicionais complexas (if/else if) na verificação de permissões, permitindo que novos papéis (ex: MODERATOR) sejam adicionados sem modificar o código existente, respeitando o Princípio Aberto-Fechado (OCP) dos princípios SOLID (Martin, 2002).

3.4.2. Chain of Responsibility (Comportamental)

O padrão Chain of Responsibility é implementado nativamente pelo Spring Security Framework através da SecurityFilterChain. A classe SecurityConfig configura uma corrente sequencial de filtros que cada requisição HTTP deve atravessar:

**1.** Filtro CSRF - Desabilitado para a API REST (stateless).

**2.** Filtro de Autorização - Verifica se a rota é pública (/api/public/\*\*, /api/posts/\*\*, /api/jobs/\*\*, /api/devskills/profile/\*\*, /api/comments/post/\*\*) ou exige autenticação.

**3.** Filtro de Role - Rotas /api/admin/\*\* exigem a authority SCOPE_admin.

**4.** Filtro JWT (OAuth2 Resource Server) - Decodifica e valida o token JWT utilizando a chave pública ECC P-256 (ES256) baixada do endpoint JWKS do Supabase.

@Bean

public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

http

.csrf(csrf -> csrf.disable())

.authorizeHttpRequests(auth -> auth

.requestMatchers("/api/public/\*\*", "/api/posts/\*\*",

"/api/jobs/\*\*", "/api/devskills/profile/\*\*",

"/api/comments/post/\*\*").permitAll()

.requestMatchers("/api/admin/\*\*").hasAuthority("SCOPE_admin")

.anyRequest().authenticated())

.oauth2ResourceServer(oauth2 -> oauth2

.jwt(Customizer.withDefaults()));

return http.build();

}

**Justificativa:** Cada filtro na cadeia tem a responsabilidade de decidir se a requisição pode prosseguir para o próximo elo ou deve ser rejeitada. Essa abordagem desacopla as responsabilidades de segurança (autenticação, autorização, validação de token) em componentes independentes e reutilizáveis (Gamma et al., 1994).

\[INSERIR PRINT: Diagrama da SecurityFilterChain mostrando o fluxo da requisição através dos filtros\]

4\. Sistemas

4.1. API RESTful

A API do DevSkills expõe seis controladores REST que seguem as convenções de nomenclatura RESTful:

Tabela 2. Controladores REST da API DevSkills

| **Controlador**        | **Base Path**      | **Operações Principais**                                         |
| ---------------------- | ------------------ | ---------------------------------------------------------------- |
| DevSkillsController    | /api/devskills     | CRUD de perfil, gerenciamento de skills, perfil público          |
| PostController         | /api/posts         | CRUD de posts, upvote/downvote, menções @username                |
| CommentController      | /api/comments      | Criação, exclusão e votação de comentários                       |
| JobOfferController     | /api/jobs          | Listagem paginada, importação via scraper, votação               |
| ChatController         | /api/chat          | Mensageria direta por ID e por @username                         |
| NotificationController | /api/notifications | Listagem, filtragem de não-lidas, marcação individual e em massa |

Todas as rotas protegidas exigem um cabeçalho Authorization: Bearer &lt;JWT&gt; válido. O token é decodificado pelo Spring Security e o subject (UUID do Supabase) é utilizado para identificar o desenvolvedor autenticado via anotação @AuthenticationPrincipal Jwt jwt.

4.2. Radar de Competências

O módulo Radar permite ao desenvolvedor gerenciar suas habilidades técnicas com operações de adição, edição de nível e remoção. No frontend, um motor analítico calcula em tempo real três métricas derivadas:

Índice de Prontidão de Mercado - Calculado como: min(100, (qtd_skills × 15) + (qtd_senior_ou_especialista × 20)).

Stack Dominante - Classificação automática entre Frontend Developer, Backend Developer, Fullstack Developer ou Engenheiro de IA, baseada na contagem e categorização das skills cadastradas.

Habilidade Mais Forte - A skill com o nível de proficiência mais alto.

4.3. Comunidade (Timeline)

A timeline funciona como um feed social com categorias (subreddits) como "Geral", "Dúvidas", "Vagas" e "Conquistas". Os posts suportam upvote/downvote com controle de voto único por usuário, incluindo remoção e inversão de voto (persistido na tabela PostVote). Os comentários também possuem sistema de votação independente. O sistema detecta menções via @username no conteúdo dos posts e gera notificações automáticas para os usuários mencionados.

4.4. Sistema de Mensageria

O módulo de chat implementa comunicação peer-to-peer entre desenvolvedores. O sistema suporta dois modos de envio:

Por UUID - Utilizado internamente quando o usuário clica em um contato existente.

Por @username - Permite que o usuário inicie uma nova conversa digitando o handle do destinatário (ex: @thallescosta), com sanitização automática do prefixo @.

4.5. Sistema de Notificações

O módulo de notificações é disparado automaticamente por eventos do sistema: quando um usuário recebe um comentário em seu post, quando alguém dá upvote em sua publicação ou quando é mencionado via @username. As notificações podem ser consultadas, filtradas por status de leitura e marcadas como lidas individual ou coletivamente.

\[INSERIR PRINT: Tela do Chat em tela cheia mostrando a lista de contatos, os balões de mensagens e a barra de digitação\]

5\. Inteligência Artificial (IA)

Embora o DevSkills não utilize modelos de aprendizado de máquina supervisionados, implementa algoritmos heurísticos inteligentes que operam sobre os dados do usuário para fornecer recomendações e classificações automáticas.

5.1. Algoritmo de Ranqueamento Multi-critério do Mercado Inteligente

O endpoint GET /api/jobs/market implementa um algoritmo de ordenação multi-critério no backend Java que classifica as vagas de emprego utilizando seis níveis de prioridade encadeados:

**1.** Faixa Temporal - Vagas são agrupadas em faixas (últimas 24h, 3 dias, 7 dias, 30 dias, mais antigas). Vagas mais recentes são priorizadas.

**2.** Vagas Brasileiras + Compatíveis - Vagas que são simultaneamente brasileiras e compatíveis com as skills do usuário recebem prioridade máxima.

**3.** Vagas Brasileiras - Vagas localizadas no Brasil são priorizadas sobre vagas internacionais.

**4.** Compatibilidade de Habilidades - Vagas cujas tags contêm pelo menos uma skill do usuário são priorizadas.

**5.** Quantidade de Skills Compatíveis - Desempate pela quantidade de matches.

**6.** Votação da Comunidade - Desempate pelo saldo líquido de upvotes/downvotes.

O algoritmo extrai as habilidades do desenvolvedor autenticado diretamente do banco de dados via JPA e realiza a comparação textual (case-insensitive) entre as tags das vagas e os nomes das skills cadastradas no Radar.

5.2. Motor de Recomendações Dinâmicas (Gap Analysis)

No frontend, um sistema de regras analisa a stack do usuário e gera recomendações contextuais. Exemplos de regras implementadas:

Se o usuário possui Java mas não possui Spring Boot → Sugere "Adicione Spring Boot para robustecer sua stack Java."

Se o usuário possui React mas não possui TypeScript → Sugere "Aprenda TypeScript para robustecer suas aplicações React."

Se o usuário possui Python mas não possui IA → Sugere "Explore modelos de IA e Machine Learning integrados ao Python."

Se nenhuma skill de conteinerização foi cadastrada → Sugere "Adicione Docker no seu radar para dominar conteinerização."

Se nenhuma skill de nuvem foi cadastrada → Sugere "Aprenda serviços de nuvem como AWS ou Azure."

5.3. Matching de Vagas no Radar

O componente Dashboard realiza um useMemo que filtra as vagas do Mercado Inteligente cujos títulos, tags ou empresas correspondem às skills cadastradas pelo desenvolvedor, exibindo as oportunidades compatíveis diretamente no painel pessoal do usuário.

\[INSERIR PRINT: Seção "Vagas Compatíveis com suas Habilidades" do Radar mostrando os job-match-cards filtrados\]

6\. Web Service

O DevSkills integra com múltiplos Web Services externos, caracterizando-o como um consumidor ativo de serviços na arquitetura orientada a serviços (SOA) (Erl, 2007):

6.1. Supabase (Backend-as-a-Service)

O Supabase atua como provedor de identidade (Identity Provider) e servidor de banco de dados:

Autenticação: O login é delegado ao Supabase Auth, que emite tokens JWT assinados com chaves assimétricas ECC P-256 (algoritmo ES256). O Spring Boot baixa automaticamente a chave pública via endpoint JWKS (/.well-known/jwks.json) para validação local dos tokens.

Banco de Dados: O PostgreSQL gerenciado pelo Supabase é acessado via JDBC com driver nativo, eliminando a necessidade de gerenciamento de infraestrutura de banco de dados.

6.2. APIs Públicas de Vagas (Job Scraper)

Um módulo scraper automatizado (job-scraper.cjs) consome seis Web Services REST públicos para coletar vagas de emprego de TI:

Tabela 3. Web Services de vagas integrados ao DevSkills

| **Web Service** | **URL Base**                                  | **Tipo de Dados**     |
| --------------- | --------------------------------------------- | --------------------- |
| RemoteOK        | <https://remoteok.com/api>                    | Vagas remotas globais |
| Arbeitnow       | <https://www.arbeitnow.com/api/job-board-api> | Vagas europeias       |
| Jobicy          | <https://jobicy.com/api/v2/remote-jobs>       | Vagas remotas         |
| ApiBR           | <https://apibr.com/vagas/api/v2/issues>       | Vagas brasileiras     |
| GitHub Backend-BR | <https://api.github.com/repos/backend-br/vagas/issues> | Vagas backend brasileiras |
| GitHub Frontend-BR | <https://api.github.com/repos/frontendbr/vagas/issues> | Vagas frontend brasileiras |

As vagas coletadas são filtradas por palavras-chave de TI (developer, engineer, java, python, react, software, devops, cloud, etc.), normalizadas para o formato interno do sistema e persistidas no banco de dados via endpoint protegido POST /api/jobs/import, autenticado por chave secreta configurada em variável de ambiente (SCRAPER_SECRET_KEY). Vagas duplicadas são automaticamente rejeitadas pela constraint UNIQUE na coluna external_id, que utiliza o prefixo da fonte concatenado com o identificador original (ex: remoteok-12345, arbeitnow-vaga-slug).

\[INSERIR PRINT: Tela do Mercado Inteligente mostrando vagas coletadas de diferentes plataformas com badges de origem\]

7\. Testes

A estratégia de testes do DevSkills contempla validações nos seguintes níveis:

7.1. Testes de Integração da API

Os testes de integração utilizam o spring-boot-starter-test em conjunto com o spring-security-test para validar o comportamento dos endpoints REST sob diferentes cenários de autenticação:

Acesso sem token: Requisições a rotas protegidas (ex: /api/devskills/me) sem o cabeçalho Authorization retornam HTTP 401 (Unauthorized).

Acesso com token válido: Requisições autenticadas com JWT válido retornam HTTP 200 e os dados esperados.

Acesso a rotas administrativas: Requisições a /api/admin/\*\* sem a authority SCOPE_admin retornam HTTP 403 (Forbidden).

7.2. Testes Funcionais do Frontend

O frontend é validado pelo compilador TypeScript (tsc -b) que garante a tipagem estática de todos os componentes antes da build de produção. O comando npm run build executa a verificação de tipos seguida da build de produção pelo Vite, garantindo que nenhum erro de tipos escapa para produção.

7.3. Validação do Scraper

O módulo scraper implementa tratamento de erros robusto com timeouts de 15 segundos por requisição, verificação de resposta HTTP e logs detalhados para cada fonte de dados. Cada fonte é isolada em sua própria função assíncrona, de modo que a falha de uma API não impede a coleta das demais.

\[INSERIR PRINT: Terminal mostrando a execução bem-sucedida dos testes ou do build de produção sem erros\]

8\. Considerações Finais

Este artigo apresentou o DevSkills, uma plataforma full-stack que endereça o problema real de fragmentação de informações e desalinhamento entre competências e mercado enfrentado por desenvolvedores de software. A solução integra, em um único ecossistema, funcionalidades de mapeamento inteligente de competências, agregação automatizada de vagas de emprego via Web Services, rede social profissional e sistema de mensageria direta.

Do ponto de vista técnico, a aplicação demonstrou a viabilidade de construir uma arquitetura robusta e escalável utilizando Java 17 com Spring Boot 3, integrando autenticação delegada via Supabase (OAuth2/JWT com ES256), persistência em PostgreSQL com JPA/Hibernate e um frontend reativo em React/TypeScript. A implementação dos padrões Strategy e Chain of Responsibility na camada de segurança evidencia a aplicação prática de princípios de design consagrados pela engenharia de software.

Como trabalhos futuros, identifica-se a oportunidade de incorporar modelos de processamento de linguagem natural (NLP) para análise semântica de descrições de vagas, a implementação de um sistema de recomendação colaborativa baseado em perfis semelhantes e a adição de WebSockets para comunicação em tempo real no módulo de chat.

O código-fonte do projeto está disponível publicamente no repositório GitHub: <https://github.com/ThallesCosta-dev/Devskills>.

Referências

Bass, L., Clements, P. e Kazman, R. (2012) "Software Architecture in Practice", 3rd edition, Addison-Wesley Professional, Boston.

Brasscom (2024) "Relatório Setorial de TIC 2024 - Macrossetor de TIC", Associação das Empresas de Tecnologia da Informação e Comunicação, São Paulo.

Erl, T. (2007) "SOA: Principles of Service Design", Prentice Hall, Upper Saddle River.

Gamma, E., Helm, R., Johnson, R. e Vlissides, J. (1994) "Design Patterns: Elements of Reusable Object-Oriented Software", Addison-Wesley, Reading.

Granovetter, M. (1973) "The Strength of Weak Ties", American Journal of Sociology, vol. 78, no. 6, p. 1360-1380.

Kaplan, A. M. e Haenlein, M. (2019) "Siri, Siri, in My Hand: Who's the Fairest in the Land? On the Interpretations, Illustrations, and Implications of Artificial Intelligence", Business Horizons, vol. 62, no. 1, p. 15-25.

Litecky, C. R., Arnett, K. P. e Prabhakar, B. (2004) "The Paradox of Soft Skills versus Technical Skills in IS Hiring", Journal of Computer Information Systems, vol. 45, no. 1, p. 69-76.

Martin, R. C. (2002) "Agile Software Development, Principles, Patterns, and Practices", Prentice Hall, Upper Saddle River.

Spring Framework (2024) "Spring Security Reference Documentation", <https://docs.spring.io/spring-security/reference/>, Accessed May 2026.

Supabase (2024) "Supabase Auth Documentation", <https://supabase.com/docs/guides/auth>, Accessed May 2026.

Walls, C. (2022) "Spring in Action", 6th edition, Manning Publications, Shelter Island.