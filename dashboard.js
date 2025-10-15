// dashboard.js
// Populates dashboard based on localStorage 'loggedInUser' pointing to a student in 'students'.
// Provides editable profile, attendance marking, search, logout, and renders Chart.js chart for grades.

(() => {
  // helpers
  function $(id){return document.getElementById(id)}
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const loggedId = localStorage.getItem('loggedInUser');

  if (!loggedId) {
    // if not logged in, redirect to login page
    window.location.href = 'login.html';
    return;
  }

  const student = students.find(s => s.id === loggedId);
  if (!student) { window.location.href = 'login.html'; return; }

  // DOM refs
  const nameEl = $('p-name');
  const emailEl = $('p-email');
  const deptEl = $('p-dept');
  const courseEl = $('p-course');
  const contactEl = $('p-contact');
  const welcomeTitle = $('welcomeTitle');
  const welcomeSub = $('welcomeSub');
  const statAttend = $('stat-attend');
  const statCourses = $('stat-courses');
  const statAssign = $('stat-assign');
  const attendancePercent = $('attendancePercent');
  const attendanceFill = $('attendanceFill');
  const courseList = $('courseList');
  const assignmentList = $('assignmentList');
  const notificationsList = $('notificationsList');
  const notifCount = $('notifCount');
  const profileModal = $('profileModal');
  const editProfileBtn = $('editProfileBtn');
  const closeModal = $('closeModal');
  const cancelProfile = $('cancelProfile');
  const saveProfile = $('saveProfile');
  const editName = $('editName');
  const editContact = $('editContact');
  const editAddress = $('editAddress');
  const logoutBtn = $('logoutBtn');
  const searchInput = $('searchInput');
  const searchBtn = $('searchBtn');
  const notifIcon = $('notifIcon');
  const topAvatar = $('topAvatar');

  // initialize UI with student data
  function initProfileUI(){
    nameEl.textContent = student.name;
    emailEl.textContent = student.email;
    deptEl.textContent = student.department;
    courseEl.textContent = `${student.course} • Year ${student.year}`;
    contactEl.textContent = student.contact;
    welcomeTitle.textContent = `Welcome, ${student.name.split(' ')[0]} 👋`;
    welcomeSub.textContent = `Last login: ${new Date(student.createdAt).toLocaleDateString()}`;

    // stats
    const attendPct = student.attendance.total === 0 ? 0 : Math.round((student.attendance.present / student.attendance.total) * 100);
    statAttend.textContent = `${attendPct}%`;
    attendancePercent.textContent = `${attendPct}%`;
    attendanceFill.style.width = `${attendPct}%`;

    statCourses.textContent = student.courses.length;
    statAssign.textContent = student.assignments.filter(a => new Date(a.due) > Date.now()).length;
  }

  function renderCourses(){
    courseList.innerHTML = '';
    student.courses.forEach(c => {
      const li = document.createElement('li');
      li.innerHTML = `<div><strong>${c}</strong><div class="muted small">Instructor: Prof. Sinha</div></div>
                      <div class="chip small muted">Active</div>`;
      courseList.appendChild(li);
    });
  }

  function renderAssignments(){
    assignmentList.innerHTML = '';
    (student.assignments || []).forEach(a => {
      const due = new Date(a.due);
      const container = document.createElement('div');
      container.className = 'assignment';
      container.innerHTML = `<div>
          <strong>${a.title}</strong>
          <div class="muted small">Due: ${due.toLocaleDateString()}</div>
        </div>
        <div style="min-width:160px; display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div class="muted small">${a.progress}%</div>
          <div class="progress-bar" style="width:140px;">
            <div class="progress-fill" style="width:${a.progress}%"></div>
          </div>
        </div>`;
      assignmentList.appendChild(container);
    });
  }

  function renderNotifications(){
    notificationsList.innerHTML = '';
    (student.notifications || []).forEach((n, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${n.title}</strong><div class="muted small">${n.text}</div>`;
      notificationsList.appendChild(li);
    });
    notifCount.textContent = (student.notifications || []).length;
  }

  // generate a simple calendar grid with placeholder events
  function renderCalendar(){
    const grid = $('calendarGrid');
    grid.innerHTML = '';
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    for (let i=0;i<7;i++){
      const d = document.createElement('div');
      d.className = 'day';
      d.innerHTML = `<strong>${days[i]}</strong>
        <div class="muted small" style="margin-top:8px">09:00 • ${student.courses[0]}</div>`;
      grid.appendChild(d);
    }
  }

  // Chart.js grades chart
  function renderGradesChart(){
    const ctx = document.getElementById('gradesChart').getContext('2d');
    const labels = student.grades.map(g => g.term);
    const data = student.grades.map(g => g.value);
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Grades (%)',
          data,
          fill: true,
          tension: 0.35,
          pointRadius:6,
          pointHoverRadius:8,
          borderWidth:2,
        }]
      },
      options: {
        responsive:true,
        maintainAspectRatio:false,
        plugins: {legend:{display:false}},
        scales:{
          y:{beginAtZero:true,max:100}
        }
      }
    });
  }

  // attendance marking logic
  $('markPresent').addEventListener('click', () => {
    student.attendance.present += 1;
    student.attendance.total += 1;
    persistStudent();
    initProfileUI();
    renderCourseBadges();
  });
  $('markAbsent').addEventListener('click', () => {
    student.attendance.total += 1;
    persistStudent();
    initProfileUI();
    renderCourseBadges();
  });

  // Edit profile flow
  editProfileBtn.addEventListener('click', () => {
    editName.value = student.name;
    editContact.value = student.contact;
    editAddress.value = student.address || '';
    profileModal.classList.remove('hidden');
  });
  closeModal.addEventListener('click', ()=> profileModal.classList.add('hidden'));
  cancelProfile.addEventListener('click', ()=> profileModal.classList.add('hidden'));
  saveProfile.addEventListener('click', ()=>{
    // basic validation
    if (!editName.value.trim()) return alert('Name cannot be empty');
    student.name = editName.value.trim();
    student.contact = editContact.value.trim();
    student.address = editAddress.value.trim();
    persistStudent();
    profileModal.classList.add('hidden');
    initProfileUI();
    alert('Profile updated');
  });

  // logout
  logoutBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    localStorage.removeItem('loggedInUser');
    // redirect to login
    window.location.href = 'login.html';
  });

  // search
  searchBtn.addEventListener('click', () => handleSearch());
  searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') handleSearch() });
  function handleSearch(){
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return alert('Enter a search term');
    // naive search: in courses, assignments, notifications
    const foundCourses = student.courses.filter(c=>c.toLowerCase().includes(q));
    const foundAssign = (student.assignments || []).filter(a=>a.title.toLowerCase().includes(q));
    const foundNot = (student.notifications || []).filter(n=>n.title.toLowerCase().includes(q) || n.text.toLowerCase().includes(q));
    // show summary
    let msg = `Search results for "${q}":\n\nCourses: ${foundCourses.length}\nAssignments: ${foundAssign.length}\nNotifications: ${foundNot.length}`;
    alert(msg);
  }

  // small rendering helper for course badges
  function renderCourseBadges(){
    // update top avatar badge etc
    topAvatar.title = student.name;
  }

  // persist student back to localStorage
  function persistStudent(){
    const all = JSON.parse(localStorage.getItem('students') || '[]');
    const idx = all.findIndex(s=>s.id===student.id);
    if (idx > -1) { all[idx] = student; } else { all.push(student); }
    localStorage.setItem('students', JSON.stringify(all));
  }

  // initialize page
  initProfileUI();
  renderCourses();
  renderAssignments();
  renderNotifications();
  renderCalendar();
  renderGradesChart();
  renderCourseBadges();

  // small UI interactions
  notifIcon.addEventListener('click', ()=> alert('You have ' + (student.notifications||[]).length + ' notifications.'));
})();
