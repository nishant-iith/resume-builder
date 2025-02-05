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
        // Basic info updates
        previewName.textContent = fullNameInput.value || "Your Name";
        previewEmail.textContent = emailInput.value || "example@example.com";
        previewPhone.textContent = phoneInput.value || "+91 XXXXXXXXXX";
        
        // Professional Summary
        previewSummary.innerHTML = document.getElementById('summary').innerHTML || "A short summary about yourself";
        
        // Education Table
        const educationRows = document.querySelectorAll('.education-row');
        const educationTableBody = document.querySelector('#previewEducation table tbody');
        educationTableBody.innerHTML = ''; // Clear existing rows

        educationRows.forEach(row => {
            const degree = row.querySelector('.degree').value;
            const institute = row.querySelector('.institute').value;
            const grade = row.querySelector('.grade').value;
            const year = row.querySelector('.year').value;

            // Only create row if at least one field is filled
            if (degree || institute || grade || year) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${degree || 'Degree'}</td>
                    <td>${institute || 'Institute'}</td>
                    <td>${grade || 'CGPA/%'}</td>
                    <td>${year || 'Year'}</td>
                `;
                educationTableBody.appendChild(tr);
            }
        });

        // Experience
        document.getElementById('previewExperience').innerHTML = 
            document.getElementById('experience').innerHTML || "Work experiences go here.";

        // Skills
        document.getElementById('previewSkills').innerHTML = 
            document.getElementById('skills').innerHTML || "Your skills";

        // Projects
        document.getElementById('previewProjects').innerHTML = 
            document.getElementById('projects').innerHTML || "Your projects will appear here.";

        // Certifications
        document.getElementById('previewCertifications').innerHTML = 
            document.getElementById('certifications').innerHTML || "Your certifications and achievements";

        // Additional Information
        document.getElementById('previewAdditional').innerHTML = 
            document.getElementById('additional').innerHTML || "Additional information";
    }

    // Update preview on any form input change
    resumeForm.addEventListener('input', updatePreview);

    // Generate Resume button updates the preview
    generateBtn.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Force refresh all content
        updatePreview();
        
        // Ensure preview is visible
        const preview = document.querySelector('.preview');
        preview.style.display = 'block';
        
        // Scroll to preview
        preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Visual feedback
        generateBtn.classList.add('active');
        setTimeout(() => generateBtn.classList.remove('active'), 200);
    });

    // Download PDF functionality
    downloadBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        
        const modal = document.getElementById('filenameModal');
        const nameBtn = document.getElementById('nameChoice');
        const emailBtn = document.getElementById('emailChoice');
        
        // Show modal
        modal.style.display = 'flex';
        
        // Handle filename choice and PDF generation
        async function handleChoice(useNameFormat) {
            modal.style.display = 'none';
            
            try {
                updatePreview();
                const resumePreview = document.getElementById('resumePreview');
                
                // Get name and email
                const name = fullNameInput.value.trim().replace(/\s+/g, '_') || 'Resume';
                const email = emailInput.value.trim().split('@')[0].toUpperCase() || 'Resume';
                
                // Set filename based on choice
                const filename = useNameFormat ? `${name}_CV` : `${email}_CV`;
                
                // Generate PDF
                const canvas = await html2canvas(resumePreview, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                });

                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'pt', 'a4');
                
                // Calculate dimensions
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                
                // Scale to fit page width with margins
                const margin = 40;
                const availableWidth = pageWidth - (2 * margin);
                const scaleFactor = availableWidth / canvasWidth;
                const scaledHeight = canvasHeight * scaleFactor;
                
                // Add image to PDF
                pdf.addImage(
                    canvas.toDataURL('image/png'),
                    'PNG',
                    margin,
                    margin,
                    availableWidth,
                    scaledHeight
                );

                // Save PDF with chosen filename
                pdf.save(`${filename}.pdf`);
                
            } catch (error) {
                console.error('PDF generation failed:', error);
                alert('Failed to generate PDF. Please try again.');
            }
        }
        
        // Add click handlers for modal buttons
        nameBtn.onclick = () => handleChoice(true);
        emailBtn.onclick = () => handleChoice(false);
        
        // Close modal if clicking outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
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
        
        // Enhanced completion check for all types of inputs
        function checkSectionCompletion() {
            const inputs = section.querySelectorAll('input');
            const textareas = section.querySelectorAll('textarea');
            const editableDivs = section.querySelectorAll('[contenteditable="true"]');
            
            const hasFilledInput = Array.from(inputs).some(i => i.value.trim() !== '');
            const hasFilledTextarea = Array.from(textareas).some(t => t.value.trim() !== '');
            const hasFilledEditable = Array.from(editableDivs).some(d => d.innerHTML.trim() !== '');
            
            if (hasFilledInput || hasFilledTextarea || hasFilledEditable) {
                section.classList.add('completed');
            } else {
                section.classList.remove('completed');
            }
        }

        // Add event listeners for all input types
        section.addEventListener('input', checkSectionCompletion);
        section.addEventListener('change', checkSectionCompletion);
        
        // Also check contenteditable divs
        const editableDivs = section.querySelectorAll('[contenteditable="true"]');
        editableDivs.forEach(div => {
            div.addEventListener('input', checkSectionCompletion);
            div.addEventListener('blur', checkSectionCompletion);
        });
        
        // Initial check
        checkSectionCompletion();
    });
});
