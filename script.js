
        function toggleTips(category) {
            const content = document.getElementById(`${category}-tips`);
            const header = content.previousElementSibling;
            const icon = header.querySelector('.toggle-icon');
            
            content.classList.toggle('active');
            icon.textContent = content.classList.contains('active') ? '−' : '+'; 
        }
        
        function searchTips() {
            const searchTerm = document.getElementById('tip-search').value.toLowerCase();
            const tips = document.querySelectorAll('.tip-content li');
            
            
            document.querySelectorAll('.tip-content').forEach(content => {
                content.classList.add('active');
                content.previousElementSibling.querySelector('.toggle-icon').textContent = '−';
            });
            
            
            tips.forEach(tip => {
                const text = tip.textContent.toLowerCase();
                if (searchTerm && !text.includes(searchTerm)) {
                    tip.style.display = 'none';
                } else {
                    tip.style.display = 'list-item';
                }
            });
        }
        
        
        function submitTip(event) {
            event.preventDefault();
            
            const game = document.getElementById('tip-game').value;
            const category = document.getElementById('tip-category').value;
            const content = document.getElementById('tip-content').value;
            
            if (!game || !category || !content) {
                alert('Please fill all fields');
                return;
            }
            
            
            alert(`Thank you for your tip about ${game}! We'll review it soon.`);
            
            
            document.getElementById('tip-form').reset();
        }
        
        
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('shooting-tips').classList.add('active');
            document.querySelector('.tip-category h2 .toggle-icon').textContent = '−';
        });

// my Page 
function validateContactForm() {
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    if (!email.includes('@') || !email.includes('.')) {
        alert('Please enter a valid email address');
        return false;
    }
    
    if (message.length < 10) {
        alert('Message should be at least 10 characters long');
        return false;
    }
    
    alert('Thank you for your message! We will respond soon.');
    return true;
}
// end of my page
        
        function filterTeam(role) {
            const members = document.querySelectorAll('.member-card');
            const tabs = document.querySelectorAll('.role-tab');
            
            
            tabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.textContent.toLowerCase().includes(role)) {
                    tab.classList.add('active');
                } else if (role === 'all' && tab.textContent === 'All Members') {
                    tab.classList.add('active');
                }
            });
            
            
            members.forEach(member => {
                if (role === 'all') {
                    member.style.display = 'block';
                } else {
                    const memberRole = member.getAttribute('data-role');
                    member.style.display = memberRole === role ? 'block' : 'none';
                }
            });
            
            
            document.getElementById('team-members').scrollIntoView({
                behavior: 'smooth'
            });
        }