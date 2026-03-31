// ===== CONSTANTS =====
const knownSkills = [
  'javascript', 'python', 'java', 'typescript', 'react', 'vue',
  'angular', 'node', 'express', 'django', 'flask', 'sql', 'mysql',
  'postgresql', 'mongodb', 'docker', 'kubernetes', 'aws', 'git',
  'linux', 'html', 'css', 'php', 'ruby', 'swift', 'kotlin', 'c++',
  'c#', 'rust', 'go', 'redis', 'graphql', 'rest', 'api'
]

const learningResources = {
  'javascript': 'https://javascript.info',
  'python': 'https://docs.python.org/3/tutorial',
  'react': 'https://react.dev/learn',
  'docker': 'https://docs.docker.com/get-started',
  'sql': 'https://sqlzoo.net',
  'aws': 'https://aws.amazon.com/training',
  'typescript': 'https://www.typescriptlang.org/docs',
  'kubernetes': 'https://kubernetes.io/docs/tutorials',
  'git': 'https://learngitbranching.js.org',
  'linux': 'https://linuxjourney.com',
  'mongodb': 'https://learn.mongodb.com',
  'node': 'https://nodejs.dev/learn',
  'django': 'https://docs.djangoproject.com/en/stable/intro',
  'flask': 'https://flask.palletsprojects.com',
  'postgresql': 'https://www.postgresqltutorial.com',
  'vue': 'https://vuejs.org/guide/introduction',
  'angular': 'https://angular.io/start',
  'graphql': 'https://graphql.org/learn',
  'rust': 'https://doc.rust-lang.org/book',
  'go': 'https://go.dev/learn',
}

// ===== INIT =====
document.body.classList.add('light')

// ===== GRAB ELEMENTS =====
const analyzeBtn = document.getElementById('analyze-btn')
const githubInput = document.getElementById('github-username')
const jobDescInput = document.getElementById('job-description')
const toggleBtn = document.getElementById('toggle-btn')

// ===== DARK/LIGHT TOGGLE =====
function toggleMode() {
  const body = document.body
  if (body.classList.contains('light')) {
    body.classList.replace('light', 'dark')
    toggleBtn.textContent = '☀️ Light'
  } else {
    body.classList.replace('dark', 'light')
    toggleBtn.textContent = '🌙 Dark'
  }
}

// ===== HAMBURGER =====
function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('open')
}

// ===== NAV TAB SWITCHING =====
function switchTab(el, id) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'))
  el.classList.add('active')
  document.getElementById(id).classList.add('active')
  document.getElementById('nav-links').classList.remove('open')
}

function switchTabById(id) {
  const ids = ['home', 'analyze', 'myskills', 'skillgap', 'jobs']
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'))
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
  document.getElementById(id).classList.add('active')
  document.querySelectorAll('.nav-item')[ids.indexOf(id)].classList.add('active')
  document.getElementById('nav-links').classList.remove('open')
}

// ===== METHOD TOGGLE =====
function switchMethod(method) {
  const pasteDiv = document.getElementById('method-paste')
  const pickDiv = document.getElementById('method-pick')
  const btnPaste = document.getElementById('btn-paste')
  const btnPick = document.getElementById('btn-pick')

  if (method === 'paste') {
    pasteDiv.classList.remove('hidden')
    pickDiv.classList.add('hidden')
    btnPaste.classList.add('active')
    btnPick.classList.remove('active')
  } else {
    pasteDiv.classList.add('hidden')
    pickDiv.classList.remove('hidden')
    btnPick.classList.add('active')
    btnPaste.classList.remove('active')
  }
}

// ===== BUILD SKILL PICKER — FIXED =====
function buildSkillPicker() {
  const picker = document.getElementById('skill-picker')
  picker.innerHTML = ''

  knownSkills.forEach(skill => {
    const btn = document.createElement('button')
    btn.className = 'skill-checkbox'
    btn.textContent = skill
    btn.type = 'button'
    btn.dataset.skill = skill
    btn.addEventListener('click', function() {
      this.classList.toggle('selected')
    })
    picker.appendChild(btn)
  })
}

buildSkillPicker()

// ===== GET PICKED SKILLS — FIXED =====
function getPickedSkills() {
  const selected = document.querySelectorAll('.skill-checkbox.selected')
  return Array.from(selected).map(btn => btn.dataset.skill)
}

// ===== GITHUB API =====
async function fetchGitHubLanguages(username) {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100`
  )
  if (!response.ok) throw new Error('GitHub user not found. Please check the username.')
  const repos = await response.json()
  const languageCount = {}
  repos.forEach(repo => {
    if (repo.language) {
      languageCount[repo.language] = (languageCount[repo.language] || 0) + 1
    }
  })
  if (Object.keys(languageCount).length === 0) throw new Error('No public repos with languages found.')
  return languageCount
}

// ===== EXTRACT SKILLS =====
function extractRequiredSkills(jobDesc) {
  const lowerDesc = jobDesc.toLowerCase()
  return knownSkills.filter(skill => lowerDesc.includes(skill))
}

// ===== FETCH JOBS =====
async function fetchJobs(skills) {
  const response = await fetch(
    `https://remotive.com/api/remote-jobs?category=software-dev&limit=20`
  )
  if (!response.ok) throw new Error('Could not fetch job listings. Please try again.')
  const data = await response.json()
  const filteredJobs = data.jobs.filter(job => {
    const title = job.title.toLowerCase()
    const tags = job.tags ? job.tags.join(' ').toLowerCase() : ''
    return skills.some(skill => title.includes(skill) || tags.includes(skill))
  })
  return filteredJobs.length > 0 ? filteredJobs.slice(0, 5) : data.jobs.slice(0, 5)
}

// ===== BROWSE ALL JOBS =====
async function browseAllJobs() {
  const browseBtn = document.querySelector('.browse-btn')
  browseBtn.textContent = 'Loading jobs...'
  browseBtn.disabled = true

  try {
    const response = await fetch(
      `https://remotive.com/api/remote-jobs?category=software-dev&limit=10`
    )
    if (!response.ok) throw new Error('Could not fetch job listings. Please try again.')
    const data = await response.json()

    document.getElementById('job-listings').innerHTML = `
      <div class="glass-card">
        <div class="card-head"><div class="card-label">All software dev listings</div></div>
        ${data.jobs.slice(0, 10).map(job => `
          <div class="job-card">
            <div class="job-info">
              <h3>${job.title}</h3>
              <p>${job.company_name} · ${job.candidate_required_location}</p>
            </div>
            <a class="view-btn" href="${job.url}" target="_blank">View →</a>
          </div>
        `).join('')}
      </div>
    `
  } catch (error) {
    alert(`Something went wrong: ${error.message}`)
  } finally {
    browseBtn.textContent = 'Browse all jobs'
    browseBtn.disabled = false
  }
}

// ===== DISPLAY RESULTS =====
function displayResults(languageCount, requiredSkills, jobs) {
  const userSkills = Object.keys(languageCount).map(l => l.toLowerCase())
  const matchedSkills = requiredSkills.filter(skill => userSkills.includes(skill))
  const missingSkills = requiredSkills.filter(skill => !userSkills.includes(skill))
  const matchPercent = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0

  // MY SKILLS
  document.getElementById('your-skills').innerHTML = `
    <div class="glass-card">
      <div class="card-head"><div class="card-label">GitHub languages</div></div>
      <div style="position:relative;z-index:2;">
        ${Object.entries(languageCount).map(([lang, count]) => `
          <span class="glass-pill have">${lang} (${count} repos)</span>
        `).join('')}
      </div>
    </div>
  `

  // REQUIRED SKILLS
  document.getElementById('required-skills').innerHTML = `
    <div class="glass-card-dark">
      <div class="score-wrap">
        <div class="score-num">${matchPercent}%</div>
        <div>
          <span class="score-strong">Match Score</span>
          <span class="score-label">${matchedSkills.length} of ${requiredSkills.length} required skills matched</span>
          <div class="progress-bg"><div class="progress-fill" style="width:${matchPercent}%"></div></div>
        </div>
      </div>
    </div>
    <div class="glass-card">
      <div class="card-head"><div class="card-label">Required vs your skills</div></div>
      <div style="position:relative;z-index:2;">
        ${requiredSkills.length > 0
          ? requiredSkills.map(skill => `
              <span class="glass-pill ${matchedSkills.includes(skill) ? 'have' : 'missing'}">
                ${skill} ${matchedSkills.includes(skill) ? '✓' : '✗'}
              </span>
            `).join('')
          : '<p class="hint-text">No recognizable skills found. Try the skill picker.</p>'
        }
      </div>
    </div>
  `

  // SKILL GAP
  document.getElementById('skill-gap').innerHTML = `
    <div class="glass-card">
      <div class="card-head"><div class="card-label">Skills to learn</div></div>
      <div style="position:relative;z-index:2;">
        ${missingSkills.length === 0
          ? '<p style="color:#006630;font-weight:600;">You have all the required skills!</p>'
          : missingSkills.map(skill => `
              <span class="glass-pill missing">${skill} ✗
                ${learningResources[skill]
                  ? `<a class="learn-btn" href="${learningResources[skill]}" target="_blank">Learn →</a>`
                  : ''
                }
              </span>
            `).join('')
        }
      </div>
    </div>
  `

  // JOBS
  document.getElementById('job-listings').innerHTML = `
    <div class="glass-card">
      <div class="card-head"><div class="card-label">Matched listings</div></div>
      ${jobs.length > 0
        ? jobs.map(job => `
            <div class="job-card">
              <div class="job-info">
                <h3>${job.title}</h3>
                <p>${job.company_name} · ${job.candidate_required_location}</p>
              </div>
              <a class="view-btn" href="${job.url}" target="_blank">View →</a>
            </div>
          `).join('')
        : '<p class="hint-text">No matching jobs found. Try Browse all jobs.</p>'
      }
    </div>
  `
}

// ===== MAIN ANALYZE =====
async function handleAnalyze() {
  const username = githubInput.value.trim()
  const isPaste = !document.getElementById('method-paste').classList.contains('hidden')
  let requiredSkills = []

  if (isPaste) {
    const jobDesc = jobDescInput.value.trim()
    if (!username || !jobDesc) {
      alert('Please fill in both your GitHub username and the job description.')
      return
    }
    requiredSkills = extractRequiredSkills(jobDesc)
  } else {
    requiredSkills = getPickedSkills()
    if (!username || requiredSkills.length === 0) {
      alert('Please enter your GitHub username and select at least one skill.')
      return
    }
  }

  analyzeBtn.textContent = 'Analyzing...'
  analyzeBtn.disabled = true

  try {
    const languageCount = await fetchGitHubLanguages(username)
    const jobs = await fetchJobs(requiredSkills)
    displayResults(languageCount, requiredSkills, jobs)
    switchTabById('myskills')
  } catch (error) {
    alert(`Something went wrong: ${error.message}`)
  } finally {
    analyzeBtn.textContent = 'Analyze my skills'
    analyzeBtn.disabled = false
  }
}