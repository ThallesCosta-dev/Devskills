export interface GuideLink {
  title: string;
  url: string;
}

export interface GuideCategory {
  title: string;
  icon: string;
  description?: string;
  links: GuideLink[];
}

export const guideData: GuideCategory[] = [
  {
    title: "Sites para estudar programação",
    icon: "GraduationCap",
    links: [
      { title: "Rocketseat", url: "https://rocketseat.com.br/" },
      { title: "Digital Innovation One", url: "http://digitalinnovation.one/" },
      { title: "Torne-se um Programador", url: "https://www.torneseumprogramador.com.br/cursos" },
      { title: "Curso em Vídeo", url: "https://www.cursoemvideo.com/" },
      { title: "Origamid", url: "https://www.origamid.com/" },
      { title: "Udemy Development", url: "https://www.udemy.com/courses/development/?price=price-free&sort=popularity" },
      { title: "HackerRank", url: "https://www.hackerrank.com/" },
      { title: "FreeCodeCamp", url: "https://www.freecodecamp.org/" },
      { title: "CodePen", url: "https://codepen.io/" },
      { title: "W3Schools", url: "https://www.w3schools.com" },
      { title: "Khan Academy", url: "https://pt.khanacademy.org/" },
      { title: "Alura", url: "https://www.alura.com.br/" },
      { title: "Coursera", url: "https://www.coursera.org/" },
      { title: "Scrimba", url: "https://scrimba.com/" },
      { title: "DataScienceAcademy", url: "https://www.datascienceacademy.com.br/" },
      { title: "FIAPx", url: "https://www.fiap.com.br/fiapx" }
    ]
  },
  {
    title: "Sites para desenvolvedor front-end",
    icon: "Paintbrush",
    links: [
      { title: "Uiverse", url: "https://uiverse.io/" },
      { title: "Shape Dividers", url: "https://shapedividers.com" },
      { title: "Couleur", url: "https://couleur.io" },
      { title: "Baseline CSS Filters", url: "https://baseline.is/tools/css-photo-filters/" },
      { title: "UI Deck", url: "https://uideck.com" },
      { title: "Naevner", url: "https://naevner.com" },
      { title: "Meta Tags", url: "https://metatags.io/" }
    ]
  },
  {
    title: "Aprender a programar jogando",
    icon: "Gamepad2",
    links: [
      { title: "Code Combat", url: "https://br.codecombat.com" },
      { title: "CheckiO", url: "https://checkio.org" },
      { title: "CodeWars", url: "https://www.codewars.com/" },
      { title: "Schemaverse", url: "https://schemaverse.com" },
      { title: "Coding Games", url: "https://www.codingame.com/" },
      { title: "Flexbox Zombie", url: "https://mastery.games/flexboxzombies/" },
      { title: "CSS Grid Attack", url: "https://codingfantasy.com/games/css-grid-attack" }
    ]
  },
  {
    title: "Templates & UI",
    icon: "Sparkles",
    links: [
      { title: "Bootstrap Made", url: "https://bootstrapmade.com/" },
      { title: "W3 Layouts", url: "https://w3layouts.com" },
      { title: "One Page Love", url: "https://onepagelove.com" },
      { title: "HTML5 UP", url: "https://html5up.net/" },
      { title: "CSS Grid Garden", url: "http://cssgridgarden.com/" },
      { title: "Flex Box Froggy", url: "https://flexboxfroggy.com/" },
      { title: "Neumorphism", url: "https://neumorphism.io/" },
      { title: "Animista", url: "https://animista.net" }
    ]
  },
  {
    title: "Ferramentas de desenvolvimento",
    icon: "Wrench",
    links: [
      { title: "Internxt", url: "https://internxt.com/" },
      { title: "Bundlephobia", url: "https://bundlephobia.com" },
      { title: "DevDocs", url: "https://devdocs.io/" },
      { title: "CloudFlare", url: "https://www.cloudflare.com/pt-br/" },
      { title: "CodeSandbox", url: "https://codesandbox.io/" },
      { title: "JSON Editor Online", url: "https://jsoneditoronline.org/" },
      { title: "Readme.so", url: "https://readme.so/pt" },
      { title: "Shields.io", url: "https://shields.io/" },
      { title: "WebPageTest", url: "https://www.webpagetest.org/" }
    ]
  },
  {
    title: "Gerenciamento de projetos",
    icon: "FolderKanban",
    links: [
      { title: "Asana", url: "https://asana.com/pt" },
      { title: "Jira", url: "https://www.atlassian.com/software/jira" },
      { title: "Miro", url: "https://miro.com/" },
      { title: "Notion", url: "https://www.notion.so/" },
      { title: "Slack", url: "https://slack.com/" },
      { title: "Trello", url: "https://www.trello.com/" }
    ]
  },
  {
    title: "IDEs e Editores",
    icon: "FileJson",
    links: [
      { title: "Visual Studio Code", url: "https://code.visualstudio.com/" },
      { title: "IntelliJ IDEA", url: "https://www.jetbrains.com/idea/" },
      { title: "NeoVim", url: "https://neovim.io/" },
      { title: "PHPStorm", url: "https://www.jetbrains.com/phpstorm/" },
      { title: "PyCharm", url: "https://www.jetbrains.com/pycharm/" },
      { title: "WebStorm", url: "https://www.jetbrains.com/webstorm/" }
    ]
  },
  {
    title: "Design Front-end",
    icon: "Palette",
    links: [
      { title: "Figma", url: "https://www.figma.com/" },
      { title: "Adobe XD", url: "https://www.adobe.com/br/products/xd.html" },
      { title: "Coolors", url: "https://coolors.co/" },
      { title: "Material-UI", url: "https://material-ui.com/" },
      { title: "Tailwind CSS", url: "https://tailwindcss.com/" },
      { title: "Remove.bg", url: "https://www.remove.bg/" }
    ]
  },
  {
    title: "Linux & Hospedagem",
    icon: "Server",
    links: [
      { title: "Ubuntu", url: "https://ubuntu.com/" },
      { title: "Pop!_Os", url: "https://pop.system76.com/" },
      { title: "Github Pages", url: "https://pages.github.com/" },
      { title: "Vercel", url: "https://vercel.com/" },
      { title: "Netlify", url: "https://www.netlify.com/" },
      { title: "Heroku", url: "https://www.heroku.com/" },
      { title: "DigitalOcean", url: "https://www.digitalocean.com/" },
      { title: "AWS", url: "https://aws.amazon.com/pt/" }
    ]
  },
  {
    title: "Imagens e Ícones",
    icon: "Image",
    links: [
      { title: "Unsplash", url: "https://unsplash.com/" },
      { title: "Pexels", url: "https://www.pexels.com/" },
      { title: "Icons8", url: "https://icons8.com.br/" },
      { title: "Flaticon", url: "https://www.flaticon.com" },
      { title: "unDraw", url: "https://undraw.co/" },
      { title: "Font Awesome", url: "https://fontawesome.com" },
      { title: "Phosphor Icon", url: "https://phosphoricons.com" },
      { title: "Feather Icons", url: "https://feathericons.com/" }
    ]
  },
  {
    title: "Canais do YouTube",
    icon: "Youtube",
    links: [
      { title: "Alura", url: "https://www.youtube.com/user/aluracursosonline" },
      { title: "CódigoFonteTV", url: "https://www.youtube.com/user/codigofontetv" },
      { title: "Rocketseat", url: "https://www.youtube.com/channel/UCSfwM5u0Kce6Cce8_S72olg" },
      { title: "Felipe Deschamps", url: "https://www.youtube.com/channel/UCU5JicSrEM5A63jkJ2QvGYw" },
      { title: "DevSoutinho", url: "https://youtube.com/c/DevSoutinho" },
      { title: "Rafaella Ballerini", url: "https://www.youtube.com/user/RafaellaBallerini/" },
      { title: "Fabio Akita", url: "https://www.youtube.com/user/AkitaOnRails" },
      { title: "Curso em Vídeo", url: "https://www.youtube.com/user/cursosemvideo" },
      { title: "Programador BR", url: "https://www.youtube.com/c/Programadorbr" }
    ]
  },
  {
    title: "Cursos de Java",
    icon: "Coffee",
    links: [
      { title: "Maratona Java Virado no Jiraya", url: "https://www.youtube.com/playlist?list=PL62G310vn6nFIsOCC0H-C2infYgwm8SWW" },
      { title: "Curso de Java para Iniciantes", url: "https://www.youtube.com/playlist?list=PLHz_AreHm4dkI2ZdjTwZA4mPMxWTfNSpR" },
      { title: "Curso de Java - Tiago Aguiar", url: "https://www.youtube.com/playlist?list=PLJ0AcghBBWSi6nK2CUkw9ngvwWB1gE8mL" },
      { title: "Curso de Java - CFBCursos", url: "https://www.youtube.com/playlist?list=PLx4x_zx8csUjFC5WWjoNUL7LOOD7LCKRW" },
      { title: "Curso de POO Java", url: "https://www.youtube.com/playlist?list=PLHz_AreHm4dkqe2aR0tQK74m8SFe-aGsY" },
      { title: "Java Tutorial for Beginners (Mosh)", url: "https://www.youtube.com/watch?v=eIrMbAQSU34" },
      { title: "Java Full Course (Bro Code)", url: "https://www.youtube.com/watch?v=xk4_1vDrzzo" },
      { title: "Java Programming for Beginners (freeCodeCamp)", url: "https://www.youtube.com/watch?v=A74TOX803D0" }
    ]
  },
  {
    title: "Cursos de JavaScript",
    icon: "Flame",
    links: [
      { title: "Curso completo de Javascript", url: "https://goo.gl/zfjfkQ" },
      { title: "Curso de introdução ao Javascript", url: "https://youtu.be/i6Oi-YtXnAU" },
      { title: "Curso Javascript básico (Guanabara)", url: "https://youtube.com/playlist?list=PLntvgXM11X6pi7mW0O4ZmfUI1xDSIbmTm" },
      { title: "Fundamentos de JavaScript Funcional", url: "https://www.cod3r.com.br/courses/javascript-funcional-fundamentos" },
      { title: "JavaScript Course (English)", url: "https://www.youtube.com/playlist?list=PLRAV69dS1uWSxUIk5o3vQY2-_VKsOpXLD" },
      { title: "15 Projetos em JavaScript", url: "https://www.youtube.com/watch?v=3PHXvlpOkf4" }
    ]
  },
  {
    title: "Cursos de HTML e CSS",
    icon: "Globe",
    links: [
      { title: "Curso em vídeo: HTML5 e CSS3", url: "https://www.youtube.com/playlist?list=PLHz_AreHm4dkZ9-atkcmcBaMZdmLHft8n" },
      { title: "Rocketseat HTML Guia Estelar", url: "https://app.rocketseat.com.br/node/o-guia-estelar-de-html" },
      { title: "Curso Completo de HTML5", url: "https://goo.gl/SD4p4g" },
      { title: "Aprenda HTML em 1 hora", url: "https://goo.gl/1kfBCZ" },
      { title: "Curso de CSS3 com Sass e Compass", url: "https://goo.gl/bAO0hE" }
    ]
  },
  {
    title: "Cursos de Python",
    icon: "Code2",
    links: [
      { title: "Real Python", url: "https://realpython.com/" },
      { title: "Curso Completo de Python (Curso em vídeo)", url: "https://www.youtube.com/playlist?list=PLvE-ZAFRgX8hnECDn1v9HNTI71veL3oW0" },
      { title: "Python para Iniciantes - Didática Tech", url: "https://www.youtube.com/playlist?list=PLyqOvdQmGdTSEPnO0DKgHlkXb8x3cyglD" },
      { title: "Python Essencial para Data Science", url: "https://www.youtube.com/playlist?list=PL3ZslI15yo2qCEmnYOa2sq6VQOzQ2CFhj" },
      { title: "Python Orientado a Objetos", url: "https://www.youtube.com/playlist?list=PLxNM4ef1Bpxhm8AfK1nDMWPDYXtmVQN-z" },
      { title: "Learn Python (freeCodeCamp)", url: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
      { title: "Python Tutorial for Beginners (Mosh)", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc" },
      { title: "CS50's Intro to Programming with Python", url: "https://cs50.harvard.edu/python/2022/" }
    ]
  },
  {
    title: "Cursos de PHP",
    icon: "Database",
    links: [
      { title: "Curso de PHP para Iniciantes", url: "https://www.youtube.com/playlist?list=PLHz_AreHm4dm4beCCCmW4xwpmLf6EHY9k" },
      { title: "Curso de PHP 8 Completo", url: "https://www.youtube.com/playlist?list=PLXik_5Br-zO9wODVI0j58VuZXkITMf7gZ" },
      { title: "Curso de POO PHP", url: "https://www.youtube.com/playlist?list=PLHz_AreHm4dmGuLII3tsvryMMD7VgcT7x" },
      { title: "Curso de PHP com MySQL", url: "https://www.youtube.com/playlist?list=PLucm8g_ezqNrkPSrXiYgGXXkK4x245cvV" },
      { title: "PHP For Absolute Beginners", url: "https://www.youtube.com/watch?v=2eebptXfEvw" },
      { title: "PHP Tutorial for Beginners", url: "https://www.youtube.com/watch?v=t0syDUSbdfE" }
    ]
  },
  {
    title: "Cursos de C#",
    icon: "Hash",
    links: [
      { title: "Curso de C# - Aprenda o essencial em 5 HORAS", url: "https://www.youtube.com/watch?v=PKMm-cHe56g" },
      { title: "Curso de Programação C#", url: "https://www.youtube.com/playlist?list=PLx4x_zx8csUglgKTmgfVFEhWWBQCasNGi" },
      { title: "Curso .NET Core C#", url: "https://www.youtube.com/playlist?list=PLs3yd28pfby7WLEdA7GXey47cKZKMrcwS" },
      { title: "C# Tutorial - Full Course for Beginners", url: "https://www.youtube.com/watch?v=GhQdlIFylQ8" },
      { title: "C# Fundamentals for Beginners", url: "https://www.youtube.com/watch?v=0QUgvfuKvWU" }
    ]
  },
  {
    title: "Cursos de C e C++",
    icon: "Cpu",
    links: [
      { title: "Curso de Linguagem C para Iniciantes", url: "https://www.youtube.com/playlist?list=PLGgRtySq3SDMLV8ee7p-rA9y032AU3zT8" },
      { title: "Linguagem C - Curso Completo", url: "https://www.youtube.com/playlist?list=PLrqNiweLEMonijPwsHckWX7fVbgT2jS3P" },
      { title: "Curso C++ - eXcript", url: "https://www.youtube.com/playlist?list=PLlesCEcYj003QTw6OhCOFb1Fdl8Uiqyrqo" },
      { title: "C++ Tutorial for Beginners (Mosh)", url: "https://www.youtube.com/watch?v=ZzaPdXTrSb8" },
      { title: "C Programming for Beginners", url: "https://www.youtube.com/playlist?list=PL98qAXLA6aftD9ZlnjpLhdQAOFI8xIB6e" }
    ]
  },
  {
    title: "Cursos de Kotlin & Swift",
    icon: "Smartphone",
    links: [
      { title: "Curso de Kotlin 1", url: "https://youtube.com/playlist?list=PLPs3nlHFeKTr-aDDvUxU971rPSVTyQ6Bn" },
      { title: "Fundamentos Android Kotlin", url: "https://cursos.alura.com.br/course/fundamentos-android-kotlin" },
      { title: "Curso de Swift - Tiago Aguiar", url: "https://www.youtube.com/playlist?list=PLJ0AcghBBWShgIH122uw7H9T9-NIaFpP-" },
      { title: "Curso grátis Swift e SwiftUI (Stanford)", url: "https://www.youtube.com/playlist?list=PLMdYygf53DP46rneFgJ7Ab6fJPcMvr8gC" },
      { title: "Swift Tutorial - Full Course for Beginners", url: "https://www.youtube.com/watch?v=comQ1-x2a1Q" }
    ]
  },
  {
    title: "Cursos de Go & Ruby",
    icon: "Rocket",
    links: [
      { title: "Aprenda Go / Golang", url: "https://www.youtube.com/playlist?list=PLUbb2i4BuuzCX8CLeArvx663_0a_hSguW" },
      { title: "Learn Go Programming (freeCodeCamp)", url: "https://www.youtube.com/watch?v=YS4e4q9oBaU" },
      { title: "Curso de Ruby on Rails para Iniciantes", url: "https://www.youtube.com/playlist?list=PLe3LRfCs4go-mkvHRMSXEOG-HDbzesyaP" },
      { title: "Ruby Para Iniciantes", url: "https://www.youtube.com/playlist?list=PLnV7i1DUV_zOit4a_tEDf1_PcRd25dL7e" },
      { title: "Learn Ruby on Rails - Full Course", url: "https://www.youtube.com/watch?v=fmyvWz5TUWg" }
    ]
  },
  {
    title: "Livros & Dicas",
    icon: "BookOpen",
    links: [
      { title: "Clean Code - Código Limpo", url: "https://g.co/kgs/62wx9t" },
      { title: "O programador pragmático", url: "https://g.co/kgs/5nbqB3" },
      { title: "Eloquent JavaScript", url: "https://eloquentjavascript.net/" },
      { title: "14 Hábitos de Desenvolvedores", url: "https://g.co/kgs/1fGbnx" },
      { title: "Web Developer Roadmap", url: "https://github.com/kamranahmedse/developer-roadmap" }
    ]
  }
];
