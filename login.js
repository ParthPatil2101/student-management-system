// login.js
// Validates login credentials against localStorage 'students'.
// On success sets 'loggedInUser' in localStorage and redirects to dashboard.html

(() => {
  const form = document.getElementById('loginForm');
  const spinner = document.getElementById('loginSpinner');
  const btnText = document.getElementById('loginBtnText');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    // clear errors
    document.getElementById('err-loginEmail').textContent = '';
    document.getElementById('err-loginPassword').textContent = '';

    if (!email) { document.getElementById('err-loginEmail').textContent = 'Enter your email'; return; }
    if (!password) { document.getElementById('err-loginPassword').textContent = 'Enter your password'; return; }

    spinner.style.opacity = 1;
    btnText.textContent = 'Signing in...';

    setTimeout(() => {
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      const match = students.find(s => s.email === email && s.password === password);
      if (!match) {
        spinner.style.opacity = 0;
        btnText.textContent = 'Sign in';
        document.getElementById('err-loginPassword').textContent = 'Invalid credentials';
        return;
      }

      // Set current logged in user id (not password) — store minimal sensitive info
      localStorage.setItem('loggedInUser', match.id);

      spinner.style.opacity = 0;
      btnText.textContent = 'Welcome!';
      // redirect to dashboard
      setTimeout(() => window.location.href = 'dashboard.html', 500);
    }, 800);
  });

  // quick Enter key submit support
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      // if on login page, trigger submit
      if (document.activeElement && (document.activeElement.tagName === 'INPUT')) {
        form.requestSubmit();
      }
    }
  });
})();
