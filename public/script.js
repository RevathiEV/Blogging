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

// Outside Click to Close
window.addEventListener('click', (e) => {
  if (e.target === signInModal) {
    signInModal.style.display = 'none';
  }
  if (e.target === signUpModal) {
    signUpModal.style.display = 'none';
  }
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

// Handle Send OTP Button Click
document.getElementById('sendOtpBtn').addEventListener('click', async function() {
  const email = document.getElementById('signUpEmail').value;

  // Send OTP
  const response = await fetch('/sendOtp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  const result = await response.json();
  if (result.success) {
    alert('OTP sent to your email');
  } else {
    alert('Failed to send OTP');
  }
});

// Handle Sign Up Form Submission with OTP Verification
document.getElementById('signUpForm').onsubmit = async function(event) {
  event.preventDefault();
  const name = document.getElementById('signUpName').value;
  const email = document.getElementById('signUpEmail').value;
  const password = document.getElementById('signUpPassword').value;
  const otp = document.getElementById('otp').value;

  // Verify OTP
  const otpResponse = await fetch('/verifyOtp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, otp })
  });

  const otpResult = await otpResponse.json();
  if (!otpResult.success) {
    alert(otpResult.message);
    return;
  }

  // Proceed with signup
  const response = await fetch('/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });

  const result = await response.json();
  if (result.message === 'User already exists. Please sign in.') {
    alert(result.message); // Show error message
  } else {
    alert(result.message); // Show success message (Please sign in)
    signUpModal.style.display = 'none'; // Hide the sign-up modal
  }
};

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

// Save Topics Button Click
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
