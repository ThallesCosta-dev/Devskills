/**
 * DevSkills — Mercado Inteligente Job Scraper
 * 
 * Fontes: RemoteOK (zero auth) + Arbeitnow (zero auth)
 * Uso:    node frontend/scraper/job-scraper.cjs
 *         (executado automaticamente pelo iniciar.bat)
 * 
 * A chave SCRAPER_SECRET_KEY é carregada do .env pelo iniciar.bat
 * e passada no header X-Scraper-Key para o endpoint /api/jobs/import.
 */

const https = require('https');
const http = require('http');

// ── Configuração ─────────────────────────────────────────────────────────────
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const SCRAPER_KEY = process.env.SCRAPER_SECRET_KEY || '';

// Palavras-chave para filtrar apenas vagas de TI relevantes
const TI_KEYWORDS = [
  'developer', 'engineer', 'backend', 'frontend', 'fullstack', 'full-stack',
  'java', 'python', 'javascript', 'typescript', 'react', 'node', 'devops',
  'cloud', 'mobile', 'ios', 'android', 'data', 'machine learning', 'ai',
  'software', 'programador', 'desenvolvedor', 'tech', 'qa', 'tester',
  'architect', 'infrastructure', 'kubernetes', 'docker', 'aws', 'azure', 'gcp',
];

// ── Utilitários ───────────────────────────────────────────────────────────────
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'DevSkills-Scraper/1.0 (educational project)',
        'Accept': 'application/json',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Erro ao parsear JSON: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function postJson(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const lib = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (url.startsWith('https') ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers,
      }
    };
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function isTechJob(title, tags = []) {
  const text = (title + ' ' + tags.join(' ')).toLowerCase();
  return TI_KEYWORDS.some(kw => text.includes(kw));
}

function truncate(str, maxLen = 2000) {
  if (!str) return '';
  // Remove HTML tags
  const clean = str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.length > maxLen ? clean.substring(0, maxLen - 3) + '...' : clean;
}

// ── Fonte 1: RemoteOK ─────────────────────────────────────────────────────────
async function scrapeRemoteOK() {
  console.log('📡 Buscando vagas RemoteOK...');
  try {
    const data = await fetchJson('https://remoteok.com/api');
    // Primeiro item é metadado legal, pular
    const jobs = Array.isArray(data) ? data.slice(1) : [];
    
    return jobs
      .filter(j => j.position && isTechJob(j.position, j.tags || []))
      .map(j => ({
        title: j.position || 'Vaga TI',
        company: j.company || 'Empresa não informada',
        description: truncate(j.description || j.position),
        sourceUrl: j.url || `https://remoteok.com/remote-jobs/${j.id}`,
        sourcePlatform: 'RemoteOK',
        location: 'Remote',
        jobType: 'REMOTE',
        tags: Array.isArray(j.tags) ? j.tags.slice(0, 10).join(',') : '',
        salaryRange: j.salary_min && j.salary_max
          ? `$${Math.round(j.salary_min / 1000)}k–$${Math.round(j.salary_max / 1000)}k/yr`
          : null,
        externalId: `remoteok-${j.id}`,
      }));
  } catch (err) {
    console.error('  ❌ RemoteOK erro:', err.message);
    return [];
  }
}

// ── Fonte 2: Arbeitnow ───────────────────────────────────────────────────────
async function scrapeArbeitnow(pages = 3) {
  console.log('📡 Buscando vagas Arbeitnow...');
  const allJobs = [];
  
  for (let page = 1; page <= pages; page++) {
    try {
      const data = await fetchJson(`https://www.arbeitnow.com/api/job-board-api?page=${page}`);
      const jobs = data.data || [];
      if (jobs.length === 0) break;
      
      for (const j of jobs) {
        if (!isTechJob(j.title, j.tags || [])) continue;
        allJobs.push({
          title: j.title || 'Vaga TI',
          company: j.company_name || 'Empresa não informada',
          description: truncate(j.description),
          sourceUrl: j.url,
          sourcePlatform: 'Arbeitnow',
          location: j.location || (j.remote ? 'Remote' : 'A definir'),
          jobType: j.remote ? 'REMOTE' : 'ONSITE',
          tags: Array.isArray(j.tags) ? j.tags.slice(0, 10).join(',') : '',
          salaryRange: null,
          externalId: `arbeitnow-${j.slug}`,
        });
      }
      
      // Pequena pausa para não sobrecarregar
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`  ❌ Arbeitnow página ${page} erro:`, err.message);
      break;
    }
  }
  
  return allJobs;
}

// ── Fonte 3: JobIcyCup (Remote Tech) ─────────────────────────────────────────
async function scrapeJobicy() {
  console.log('📡 Buscando vagas Jobicy...');
  try {
    const data = await fetchJson('https://jobicy.com/api/v2/remote-jobs?count=50&industry=software-development');
    const jobs = data.jobs || [];
    
    return jobs
      .filter(j => j.jobTitle && isTechJob(j.jobTitle, j.jobIndustry ? [j.jobIndustry] : []))
      .map(j => ({
        title: j.jobTitle,
        company: j.companyName || 'Empresa não informada',
        description: truncate(j.jobDescription),
        sourceUrl: j.url,
        sourcePlatform: 'Jobicy',
        location: j.jobGeo || 'Remote',
        jobType: 'REMOTE',
        tags: j.jobType ? j.jobType.join(',') : '',
        salaryRange: j.annualSalaryMin && j.annualSalaryMax
          ? `$${Math.round(j.annualSalaryMin / 1000)}k–$${Math.round(j.annualSalaryMax / 1000)}k/yr`
          : null,
        externalId: `jobicy-${j.id}`,
      }));
  } catch (err) {
    console.error('  ❌ Jobicy erro:', err.message);
    return [];
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 DevSkills Mercado Inteligente — Scraper iniciado');
  console.log(`⏰ ${new Date().toLocaleString('pt-BR')}\n`);

  // Coleta de todas as fontes em paralelo
  const [remoteOkJobs, arbeitnowJobs, jobicyJobs] = await Promise.all([
    scrapeRemoteOK(),
    scrapeArbeitnow(3),
    scrapeJobicy(),
  ]);

  const allJobs = [...remoteOkJobs, ...arbeitnowJobs, ...jobicyJobs];
  console.log(`\n📦 Total coletado: ${allJobs.length} vagas`);
  console.log(`   RemoteOK: ${remoteOkJobs.length} | Arbeitnow: ${arbeitnowJobs.length} | Jobicy: ${jobicyJobs.length}`);

  if (allJobs.length === 0) {
    console.log('⚠️  Nenhuma vaga coletada. Verifique a conexão com a internet.');
    return;
  }

  // Envia em lotes de 50 para o backend
  const BATCH_SIZE = 50;
  let totalImported = 0;
  let totalSkipped = 0;

  for (let i = 0; i < allJobs.length; i += BATCH_SIZE) {
    const batch = allJobs.slice(i, i + BATCH_SIZE);
    console.log(`\n📤 Enviando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allJobs.length / BATCH_SIZE)} (${batch.length} vagas)...`);
    
    try {
      const result = await postJson(
        `${BACKEND_URL}/api/jobs/import`,
        batch,
        SCRAPER_KEY ? { 'X-Scraper-Key': SCRAPER_KEY } : {}
      );
      
      if (result.status === 200) {
        console.log(`   ✅ Importadas: ${result.body.imported} | Já existiam: ${result.body.skipped}`);
        totalImported += result.body.imported || 0;
        totalSkipped += result.body.skipped || 0;
      } else {
        console.error(`   ❌ Erro ${result.status}:`, result.body);
      }
    } catch (err) {
      console.error('   ❌ Erro ao enviar lote:', err.message);
    }

    // Pausa entre lotes
    if (i + BATCH_SIZE < allJobs.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log(`\n✨ Scraping concluído!`);
  console.log(`   Total novas vagas: ${totalImported}`);
  console.log(`   Duplicatas ignoradas: ${totalSkipped}`);
  console.log(`   Banco de dados atualizado em: ${new Date().toLocaleString('pt-BR')}\n`);
}

main().catch(err => {
  console.error('❌ Erro fatal no scraper:', err);
  process.exit(1);
});
