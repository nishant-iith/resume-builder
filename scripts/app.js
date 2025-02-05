// Wait until the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const resumeForm = document.getElementById('resumeForm');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Input fields
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const summaryInput = document.getElementById('summary');
    const skillsInput = document.getElementById('skills');
    const experienceInput = document.getElementById('experience');
    const educationInput = document.getElementById('education');

    // Preview fields
    const previewName = document.getElementById('previewName');
    const previewEmail = document.getElementById('previewEmail');
    const previewPhone = document.getElementById('previewPhone');
    const previewSummary = document.getElementById('previewSummary');
    const previewSkills = document.getElementById('previewSkills');
    const previewExperience = document.getElementById('previewExperience');
    const previewEducation = document.getElementById('previewEducation');
    const resumePreview = document.getElementById('resumePreview');

    // Phone number formatting
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        
        if (value.length > 0) {
            // If number starts with 91, treat as country code
            if (value.startsWith('91') && value.length > 2) {
                value = value.substr(2);
            }
            
            // Ensure the number starts with valid Indian mobile prefix
            if (value.length > 0 && !'6789'.includes(value[0])) {
                value = '';
            }
            
            // Limit to 10 digits
            value = value.substr(0, 10);
            
            // Format with +91 prefix if it's a valid length
            if (value.length === 10) {
                value = '+91 ' + value;
            }
        }
        
        e.target.value = value;
    });

    // Text Editor Functionality - now handles both summary and experience
    const editors = document.querySelectorAll('.text-editor');
    const toolbars = document.querySelectorAll('.text-editor-toolbar');
    
    toolbars.forEach(toolbar => {
        toolbar.addEventListener('click', function(e) {
            const button = e.target.closest('button');
            if (!button) return;

            e.preventDefault();
            const command = button.dataset.command;
            
            // Get the associated editor for this toolbar
            const editor = this.nextElementSibling;

            // Save selection state
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);

            // Focus the correct editor
            editor.focus();
            selection.removeAllRanges();
            selection.addRange(range);

            if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
                document.execCommand(command, false, null);
            } else {
                document.execCommand(command, false, null);
            }

            // Toggle active state for buttons
            if (!['insertUnorderedList', 'insertOrderedList'].includes(command)) {
                button.classList.toggle('active');
            }
            
            updatePreview();
        });
    });

    // Initialize editors with placeholder
    editors.forEach(editor => {
        editor.addEventListener('focus', function() {
            if (editor.innerHTML === '') {
                editor.innerHTML = '';
            }
        });

        editor.addEventListener('blur', function() {
            if (editor.innerHTML === '') {
                editor.innerHTML = '';
            }
        });
    });

    // Function to update the resume preview based on form inputs
    function updatePreview() {
        previewName.textContent = fullNameInput.value || "Your Name";
        previewEmail.textContent = emailInput.value || "example@example.com";
        previewPhone.textContent = phoneInput.value || "+91 XXXXXXXXXX";
        previewSummary.innerHTML = document.getElementById('summary').innerHTML || "A short summary about yourself";
        previewExperience.innerHTML = document.getElementById('experience').innerHTML || "Work experiences go here.";

        // Format skills (split by commas and join back with a comma-space)
        let skills = skillsInput.value;
        if (skills.trim() !== "") {
            previewSkills.textContent = skills.split(",").map(skill => skill.trim()).join(", ");
        } else {
            previewSkills.textContent = "Your skills";
        }

        // Update education table
        const educationRows = document.querySelectorAll('.education-row');
        const educationTableBody = document.querySelector('#previewEducation table tbody');
        educationTableBody.innerHTML = ''; // Clear existing rows

        educationRows.forEach(row => {
            const degree = row.querySelector('.degree').value || 'Degree';
            const institute = row.querySelector('.institute').value || 'Institute';
            const grade = row.querySelector('.grade').value || 'CGPA/%';
            const year = row.querySelector('.year').value || 'Year';

            if (degree || institute || grade || year) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${degree}</td>
                    <td>${institute}</td>
                    <td>${grade}</td>
                    <td>${year}</td>
                `;
                educationTableBody.appendChild(tr);
            }
        });

        // Update formatted sections
        previewSummary.innerHTML = document.getElementById('summary').innerHTML || "A short summary about yourself";
        previewExperience.innerHTML = document.getElementById('experience').innerHTML || "Work experiences go here.";
        
        // Add preview updates for certifications and additional info
        if (document.getElementById('previewCertifications')) {
            document.getElementById('previewCertifications').innerHTML = 
                document.getElementById('certifications').innerHTML || "Your certifications and achievements";
        }
        
        if (document.getElementById('previewAdditional')) {
            document.getElementById('previewAdditional').innerHTML = 
                document.getElementById('additional').innerHTML || "Additional information";
        }

        // Update Projects
        document.getElementById('previewProjects').innerHTML = 
            document.getElementById('projects').value || "Your projects will appear here.";

        // Update Certifications
        document.getElementById('previewCertifications').innerHTML = 
            document.getElementById('certifications').innerHTML || "Your certifications and achievements";

        // Update Additional Information
        document.getElementById('previewAdditional').innerHTML = 
            document.getElementById('additional').innerHTML || "Additional information";
    }

    // Update preview on any form input change
    resumeForm.addEventListener('input', updatePreview);

    // Generate Resume button updates the preview
    generateBtn.addEventListener('click', function () {
        updatePreview();
    });

    // Download PDF functionality using html2canvas and jsPDF
    downloadBtn.addEventListener('click', function () {
        updatePreview(); // ensure latest changes are reflected
        html2canvas(resumePreview, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            // Using the jsPDF UMD module; note the destructuring for compatibility.
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });
            // Calculate dimensions for A4 paper
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate image dimensions to maintain aspect ratio
            const imgWidth = pdfWidth - 40; // leaving some margin
            const imgHeight = canvas.height * imgWidth / canvas.width;

            pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
            pdf.save('resume.pdf');
        });
    });

    // Collapsible sections functionality
    const formSections = document.querySelectorAll('.form-section');
    
    formSections.forEach(section => {
        const header = section.querySelector('.form-section-header');
        const content = section.querySelector('.form-section-content');
        
        header.addEventListener('click', () => {
            // Close other sections
            formSections.forEach(s => {
                if (s !== section && s.classList.contains('active')) {
                    s.classList.remove('active');
                }
            });
            
            // Toggle current section
            section.classList.toggle('active');
        });
        
        // Mark section as completed when filled
        const inputs = section.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                if (Array.from(inputs).some(i => i.value.trim() !== '')) {
                    section.classList.add('completed');
                } else {
                    section.classList.remove('completed');
                }
            });
        });
    });
});
