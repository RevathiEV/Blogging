// Modal Handling
const signInModal = document.getElementById('signInModal');
const signUpModal = document.getElementById('signUpModal');
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const closeSignIn = document.getElementById('closeSignIn');
const closeSignUp = document.getElementById('closeSignUp');
const topicsSection = document.getElementById('topicsSection');
const saveTopicsBtn = document.getElementById('saveTopics');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const otpModal = document.getElementById('otpModal'); // OTP modal
const closeOtpModal = document.getElementById('closeOtpModal'); // Close OTP modal button
const otpForm = document.getElementById('otpForm'); // OTP form
const otpInput = document.getElementById('otpInput'); // OTP input field
const signUpEmailInput = document.getElementById('signUpEmail'); // Sign-up email input

// Open Modals
signInBtn.addEventListener('click', () => {
  signInModal.style.display = 'block';
});

signUpBtn.addEventListener('click', () => {
  signUpModal.style.display = 'block';
});

// Close Modals
closeSignIn.addEventListener('click', () => {
  signInModal.style.display = 'none';
});

closeSignUp.addEventListener('click', () => {
  signUpModal.style.display = 'none';
});

// Close OTP Modal
closeOtpModal.onclick = function () {
  otpModal.style.display = 'none';
};

// Outside Click to Close
window.addEventListener('click', (e) => {
  if (e.target == signInModal) {
    signInModal.style.display = 'none';
  }
  if (e.target == signUpModal) {
    signUpModal.style.display = 'none';
  }
  if (e.target == otpModal) {
    otpModal.style.display = 'none';
  }
});

// Sign Up Form Submission (Trigger OTP Modal)
document.getElementById('signUpForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form submission
  
  const name = document.getElementById('signUpName').value;
  const email = signUpEmailInput.value;
  const password = document.getElementById('signUpPassword').value;

  // Trigger OTP sending functionality
  fetch('/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'OTP sent to your email') {
      // Open OTP modal
      otpModal.style.display = 'block';
    } else {
      // Show error message
      alert(data.message);
    }
  })
  .catch(error => console.error('Error:', error));
});

// OTP Form Submission
otpForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const otpValue = otpInput.value;
  const email = signUpEmailInput.value; // Use the email from sign-up

  // Validate OTP by sending it to the backend
  fetch('/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, otp: otpValue }) // Include email with OTP
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'OTP verified, user registered successfully') {
      // OTP is correct, navigate to topics page or show topics section
      otpModal.style.display = 'none';
      topicsSection.style.display = 'block';
    } else {
      // OTP is incorrect, show error message
      alert(data.message);
    }
  })
  .catch(error => console.error('Error verifying OTP:', error));
});

// Search Functionality
searchButton.addEventListener('click', () => {
  const searchText = searchInput.value.toLowerCase();
  document.querySelectorAll('.topics label').forEach((label) => {
    const topicText = label.textContent.toLowerCase();
    if (topicText.includes(searchText)) {
      label.style.display = 'inline-block';
    } else {
      label.style.display = 'none';
    }
  });
});

// Save Topics Button Click
saveTopicsBtn.addEventListener('click', () => {
  const selectedTopics = [];
  document.querySelectorAll('.topics input:checked').forEach((checkbox) => {
    selectedTopics.push(checkbox.value);
  });
  
  // Redirect to feed.html with selected topics
  const queryString = selectedTopics.map(topic => `topic=${encodeURIComponent(topic)}`).join('&');
  window.location.href = `feed.html?${queryString}`;
});

// Handle Sign Up Form Submission (Backend Interaction)
document.getElementById('signUpForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signUpName').value;
  const email = signUpEmailInput.value;
  const password = document.getElementById('signUpPassword').value;

  fetch('/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'User already exists. Please sign in.') {
      alert(data.message); // Show error message
    } else {
      alert(data.message); // Show success message (Please sign in)
      signUpModal.style.display = 'none'; // Hide the sign-up modal
    }
  })
  .catch(error => console.error('Error:', error));
});

// Handle Sign In Form Submission
document.getElementById('signInForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;

  fetch('/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Sign in successful') {
      // Redirect to topics page (or make topics section visible)
      signInModal.style.display = 'none';
      topicsSection.style.display = 'block';
      localStorage.setItem('userEmail', email); // Store user email in localStorage
    } else {
      alert(data.message); // Show error message
    }
  })
  .catch(error => console.error('Error:', error));
});

// Save Topics Button Click (Backend Interaction)
saveTopicsBtn.addEventListener('click', () => {
  const selectedTopics = [];
  document.querySelectorAll('.topics input:checked').forEach((checkbox) => {
    selectedTopics.push(checkbox.value);
  });

  // Retrieve the signed-in user's email from localStorage
  const email = localStorage.getItem('userEmail');
  
  fetch('/savetopics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, topics: selectedTopics })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message); // Show success message
  })
  .catch(error => console.error('Error:', error));
});
