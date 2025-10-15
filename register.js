// register.js
// Handles client-side validation and storing user info in localStorage.
// Link: registration.html includes this file.

(() => {
  const form = document.getElementById('registerForm');
  const spinner = document.getElementById('regSpinner');
  const btnText = document.getElementById('registerBtnText');

  // utility validators
  function isEmail(email) {
    // simple regex for email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function isPhone(phone) {
    // accept digits and + and spaces, min 7 max 15 digits
    return /^[\d+\s]{7,15}$/.test(phone);
  }
  function calcAge(dob) {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  // show error message helper
  function setError(id, message) {
    const el = document.getElementById('err-' + id);
    if (el) el.textContent = message || '';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // grab values
    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const gender = form.gender.value;
    const dob = form.dob.value;
    const department = form.department.value;
    const course = form.course.value.trim();
    const year = form.year.value;
    const contact = form.contact.value.trim();
    const address = form.address.value.trim();

    // reset errors
    ['name','email','password','confirmPassword','gender','dob','department','course','year','contact','address'].forEach(x=>setError(x,''));

    // validations
    let valid = true;
    if (!name || name.length < 3) { setError('name','Enter full name (min 3 chars)'); valid=false;}
    if (!email || !isEmail(email)) { setError('email','Enter a valid email'); valid=false;}
    if (!password || password.length < 8) { setError('password','Password must be 8+ characters'); valid=false;}
    if (password !== confirmPassword) { setError('confirmPassword','Passwords do not match'); valid=false;}
    if (!gender) { setError('gender','Select gender'); valid=false;}
    if (!dob || calcAge(dob) < 13) { setError('dob','Enter valid DOB (age 13+)'); valid=false;}
    if (!department) { setError('department','Select department'); valid=false;}
    if (!course) { setError('course','Enter course name'); valid=false;}
    if (!year) { setError('year','Select year'); valid=false;}
    if (!contact || !isPhone(contact)) { setError('contact','Enter valid contact number'); valid=false;}
    if (!address || address.length < 5) { setError('address','Enter a valid address'); valid=false;}

    // check if email already registered
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    if (students.some(s => s.email === email)) {
      setError('email','Email already registered. Try logging in.');
      valid = false;
    }

    if (!valid) return;

    // show spinner and fake processing animation
    spinner.style.opacity = 1;
    btnText.textContent = 'Registering...';

    setTimeout(() => {
      // assemble student object
      const student = {
        id: 'stu_' + Date.now(),
        name, email, password, gender, dob, department, course, year, contact, address,
        // default dashboard state
        attendance: {present: 0, total: 0},
        courses: [course],
        assignments: [
          {id: 'a1', title: 'Intro assignment', due: new Date(Date.now()+5*24*3600*1000).toISOString(), progress: 20}
        ],
        grades: [ {term: 'Term1', value: 72}, {term: 'Term2', value: 78}, {term: 'Term3', value: 82} ],
        notifications: [
          {id:'n1',title:'Welcome!',text:'Welcome to StudentMgmt. Your profile is ready.'}
        ],
        createdAt: new Date().toISOString()
      };

      students.push(student);
      localStorage.setItem('students', JSON.stringify(students));

      // reset UI
      spinner.style.opacity = 0;
      btnText.textContent = 'Registered ✓';

      // redirect to login after tiny delay
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 700);
    }, 800);
  });

  // small UI polish: animate focus inputs
  Array.from(document.querySelectorAll('input,select,textarea')).forEach(inp=>{
    inp.addEventListener('focus', ()=> inp.classList.add('focused'));
    inp.addEventListener('blur', ()=> inp.classList.remove('focused'));
  });
})();
