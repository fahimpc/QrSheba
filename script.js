document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const stepPanels = document.querySelectorAll(".step-panel");
    const stepIndicators = document.querySelectorAll(".step-indicator");
    const nextStepBtns = document.querySelectorAll(".next-step-btn");
    const prevStepBtns = document.querySelectorAll(".prev-step-btn");
    const startOverBtn = document.querySelector(".start-over-btn");
    const qrTypeCards = document.querySelectorAll(".qr-type-card");
    const dataInputTabs = document.querySelectorAll(".data-input-tab");
    const qrCodeContainer = document.getElementById("qr-code-canvas");
    const barcodeDisplay = document.getElementById("barcode-display");
    const previewPlaceholderText = document.querySelector(".preview-placeholder-text");

    // Form Inputs & Controls
    const allInputs = document.querySelectorAll('.input-form input, .input-form textarea, .input-form select, .design-options-grid input, .design-options-grid select');
    const qrResolutionSlider = document.getElementById("qr-resolution");
    const resolutionDisplay = document.getElementById("resolution-display");
    const logoUpload = document.getElementById("logo-upload");
    const removeLogoBtn = document.getElementById("remove-logo");

    // New Currency Select Elements
    const bitcoinCurrency = document.getElementById("bitcoin-currency");
    const paypalCurrency = document.getElementById("paypal-currency");

    // Download Buttons
    const downloadPngBtn = document.getElementById("download-btn-png");
    const downloadSvgBtn = document.getElementById("download-btn-svg");
    const downloadJpgBtn = document.getElementById("download-btn-jpg");

    // FAQ Modal Elements
    const faqOverlay = document.getElementById("faq-overlay");
    const faqCloseBtn = document.querySelector(".faq-close-btn");
    const showFaqBtn = document.getElementById("show-faq-btn");

    // Mobile Menu
    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.querySelector(".main-nav");

    let currentStep = 1;
    let selectedQrType = 'text-url'; // Default selected QR type
    let logoFile = null;
    let qrCodeInstance = null; // Stores the QRCodeStyling instance

    // --- Initialization ---
    function initializeGenerator() {
        showStep(currentStep);
        updateStepIndicators();
        activateQrType('text-url'); // Activate default on load
        // Initial generation based on default type and empty data
        // This will show the placeholder until data is entered
        generateCode(); 
        removeLogoBtn.style.display = 'none'; // Hide remove logo button initially
    }

    // --- Step Navigation Logic ---
    function showStep(stepNum) {
        stepPanels.forEach(panel => panel.classList.remove('active'));
        document.getElementById(`step-${stepNum}`).classList.add('active');
        currentStep = stepNum;
        updateStepIndicators();
        updatePreviewVisibility(); // Update preview visibility on step change
    }

    function updateStepIndicators() {
        stepIndicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            if (index + 1 === currentStep) {
                indicator.classList.add('active');
            } else if (index + 1 < currentStep) {
                indicator.classList.add('completed');
            }
        });

        // Set line width for completed steps
        const stepLines = document.querySelectorAll('.step-line');
        stepLines.forEach((line, index) => {
            // Line should be active if its corresponding next step is active or completed
            if (index + 2 <= currentStep) {
                line.style.background = 'linear-gradient(90deg, var(--primary-green), var(--primary-blue))';
            } else {
                line.style.background = 'var(--border-light)';
            }
        });
    }

    // --- QR Type Selection Logic (Step 1) ---
    function activateQrType(type) {
        qrTypeCards.forEach(card => card.classList.remove('active'));
        const selectedCard = document.querySelector(`.qr-type-card[data-type="${type}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
            selectedQrType = type;
            showDataInputTab(type); // Show corresponding input form
            generateCode(); // Regenerate code based on new type
        }
    }

    function showDataInputTab(type) {
        dataInputTabs.forEach(tab => tab.classList.remove('active'));
        const targetTab = document.getElementById(`${type}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    // --- Unified Code Generation Trigger ---
    function generateCode() {
        if (selectedQrType === 'barcode') {
            generateBarcode();
        } else {
            generateQRCode();
        }
        updatePreviewVisibility(); // Always ensure correct preview is visible after generation
    }

    // --- Preview Panel Control ---
    function updatePreviewVisibility() {
        if (currentStep < 2 || !getDataForType(selectedQrType)) { // No preview if on step 1 or no data
            qrCodeContainer.style.display = 'none';
            barcodeDisplay.style.display = 'none';
            previewPlaceholderText.style.display = 'block';
        } else {
            previewPlaceholderText.style.display = 'none';
            if (selectedQrType === 'barcode') {
                qrCodeContainer.style.display = 'none';
                barcodeDisplay.style.display = 'block';
            } else {
                qrCodeContainer.style.display = 'flex'; // Use flex for centering
                barcodeDisplay.style.display = 'none';
            }
        }
    }

    // Helper to get data based on active type
    function getDataForType(type) {
        let data = "";
        switch (type) {
            case 'text-url':
                data = document.getElementById("text-url-input").value;
                break;
            case 'wifi':
                const ssid = document.getElementById("wifi-ssid").value;
                const password = document.getElementById("wifi-password").value;
                const encryption = document.getElementById("wifi-encryption").value;
                const hidden = document.getElementById("wifi-hidden").checked ? 'true' : 'false';
                data = `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden};`;
                break;
            case 'vcard':
                const firstName = document.getElementById("vcard-firstname").value;
                const lastName = document.getElementById("vcard-lastname").value;
                const organization = document.getElementById("vcard-organization").value;
                const title = document.getElementById("vcard-title").value;
                const phone = document.getElementById("vcard-phone").value;
                const email = document.getElementById("vcard-email").value;
                const address = document.getElementById("vcard-address").value;
                const website = document.getElementById("vcard-website").value;

                if (!firstName && !lastName && !organization && !title && !phone && !email && !address && !website) return ""; // Require at least one field
                
                data = `BEGIN:VCARD\nVERSION:3.0\nN:${lastName};${firstName}\n`;
                if (organization) data += `ORG:${organization}\n`;
                if (title) data += `TITLE:${title}\n`;
                if (phone) data += `TEL:${phone}\n`;
                if (email) data += `EMAIL:${email}\n`;
                if (address) data += `ADR:;;${address}\n`;
                if (website) data += `URL:${website}\n`;
                data += `END:VCARD`;
                break;
            case 'email':
                const emailTo = document.getElementById("email-to").value;
                const emailSubject = encodeURIComponent(document.getElementById("email-subject").value);
                const emailBody = encodeURIComponent(document.getElementById("email-body").value);
                data = `mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`;
                break;
            case 'sms':
                const smsPhone = document.getElementById("sms-phone").value;
                const smsMessage = encodeURIComponent(document.getElementById("sms-message").value);
                data = `SMSTO:${smsPhone}:${smsMessage}`;
                break;
            case 'phone':
                data = `tel:${document.getElementById("phone-number").value}`;
                break;
            case 'location':
                const latitude = document.getElementById("location-latitude").value;
                const longitude = document.getElementById("location-longitude").value;
                data = `geo:${latitude},${longitude}`;
                break;
            case 'event':
                const eventTitle = encodeURIComponent(document.getElementById("event-title").value);
                const eventLocation = encodeURIComponent(document.getElementById("event-location").value);
                const eventStartInput = document.getElementById("event-start").value;
                const eventEndInput = document.getElementById("event-end").value;
                const eventDescription = encodeURIComponent(document.getElementById("event-description").value);

                let eventStart = '';
                let eventEnd = '';

                if (eventStartInput) {
                    const dateObj = new Date(eventStartInput);
                    if (!isNaN(dateObj.getTime())) { // Check for valid date
                        eventStart = dateObj.toISOString().replace(/[-:]|\.\d{3}/g, '').split('.')[0] + 'Z'; // Format to UTC Zulu time
                    }
                }
                if (eventEndInput) {
                    const dateObj = new Date(eventEndInput);
                    if (!isNaN(dateObj.getTime())) { // Check for valid date
                        eventEnd = dateObj.toISOString().replace(/[-:]|\.\d{3}/g, '').split('.')[0] + 'Z'; // Format to UTC Zulu time
                    }
                }

                if (!eventTitle && !eventLocation && !eventStart && !eventEnd && !eventDescription) return ""; // Require at least one field

                data = `BEGIN:VEVENT\nSUMMARY:${eventTitle}\nLOCATION:${eventLocation}\n`;
                if (eventStart) data += `DTSTART:${eventStart}\n`;
                if (eventEnd) data += `DTEND:${eventEnd}\n`;
                if (eventDescription) data += `DESCRIPTION:${eventDescription}\n`;
                data += `END:VEVENT`;
                break;
            case 'paypal':
                const paypalEmail = document.getElementById("paypal-email").value;
                const paypalAmount = document.getElementById("paypal-amount").value;
                const paypalItem = encodeURIComponent(document.getElementById("paypal-item").value);
                const selectedPaypalCurrency = paypalCurrency.value; // Get selected currency
                if (!paypalEmail && !paypalAmount && !paypalItem) return "";
                data = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(paypalEmail)}`;
                if (paypalAmount) {
                    data += `&amount=${encodeURIComponent(paypalAmount)}`;
                }
                data += `&currency_code=${encodeURIComponent(selectedPaypalCurrency)}`; // Add currency code
                if (paypalItem) {
                    data += `&item_name=${paypalItem}`;
                }
                break;
            case 'bitcoin':
                const bitcoinAddress = document.getElementById("bitcoin-address").value;
                const bitcoinAmount = document.getElementById("bitcoin-amount").value;
                const bitcoinMessage = encodeURIComponent(document.getElementById("bitcoin-message").value);
                const selectedBitcoinCurrency = bitcoinCurrency.value; // Get selected currency (for display/context)

                if (!bitcoinAddress && !bitcoinAmount && !bitcoinMessage) return "";
                
                let bitcoinData = `bitcoin:${bitcoinAddress}`;
                const params = [];
                if (bitcoinAmount) {
                    // Bitcoin amount should technically be in BTC for the URI.
                    // If bitcoinAmount is in fiat and needs conversion, that logic
                    // would go here (e.g., using a crypto exchange rate API).
                    // For now, assuming bitcoinAmount is either BTC or for display.
                    params.push(`amount=${bitcoinAmount}`);
                }
                if (bitcoinMessage) {
                    params.push(`message=${bitcoinMessage}`);
                }
                // If you want to include the selected fiat currency for *display purposes*
                // within the QR code (e.g., in the label), you could modify label here.
                // Ex: if (selectedBitcoinCurrency && bitcoinAmount) { params.push(`label=Amount: ${bitcoinAmount} ${selectedBitcoinCurrency}`); }

                if (params.length > 0) {
                    bitcoinData += `?${params.join('&')}`;
                }
                data = bitcoinData;
                break;
            case 'app-download':
                const androidUrl = document.getElementById("app-android-url").value;
                const iosUrl = document.getElementById("app-ios-url").value;
                if (!androidUrl && !iosUrl) return "";
                let appData = '';
                if (androidUrl) appData += `ANDROID:${androidUrl}\n`;
                if (iosUrl) appData += `IOS:${iosUrl}\n`;
                data = appData;
                break;
            case 'barcode':
                data = document.getElementById("barcode-data").value;
                break;
        }
        return data;
    }

    // QR Code Generation
    function generateQRCode() {
        const data = getDataForType(selectedQrType);
        
        // Clear previous QR code if no data
        if (!data) {
            if (qrCodeInstance) {
                qrCodeInstance.clear(); // Clear the QR code if no data
                qrCodeInstance = null; // Reset instance
            }
            qrCodeContainer.innerHTML = ''; // Ensure div is empty
            return;
        }

        const options = {
            width: parseInt(qrResolutionSlider.value),
            height: parseInt(qrResolutionSlider.value),
            data: data, // Ensure data is set here
            image: logoFile,
            dotsOptions: {
                color: document.getElementById("qr-color").value,
                type: document.getElementById("qr-dot-style").value
            },
            backgroundOptions: {
                color: document.getElementById("qr-bg-color").value,
            },
            cornersSquareOptions: {
                color: document.getElementById("qr-color").value,
                type: document.getElementById("qr-corner-style").value
            },
            cornersDotOptions: {
                color: document.getElementById("qr-color").value,
                type: document.getElementById("qr-corner-style").value
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 5
            },
            responsive: true,
        };

        const gradientType = document.getElementById("qr-gradient-type").value;
        if (gradientType !== 'none') {
            const gradientColors = [
                { offset: 0, color: document.getElementById("qr-gradient-color1").value },
                { offset: 1, color: document.getElementById("qr-gradient-color2").value }
            ];
            options.dotsOptions.gradient = {
                type: gradientType,
                rotation: 0, 
                colorStops: gradientColors
            };
            options.cornersSquareOptions.gradient = {
                type: gradientType,
                rotation: 0,
                colorStops: gradientColors
            };
            options.cornersDotOptions.gradient = {
                type: gradientType,
                rotation: 0,
                colorStops: gradientColors
            };
        } else {
            // Remove gradient options if 'none' is selected
            delete options.dotsOptions.gradient;
            delete options.cornersSquareOptions.gradient;
            delete options.cornersDotOptions.gradient;
        }

        if (!qrCodeInstance) {
    qrCodeInstance = new QRCodeStyling(options);
    qrCodeContainer.innerHTML = ''; // পূর্বের ক্যানভাস মুছে দিন
    qrCodeInstance.append(qrCodeContainer);
       } else {
    qrCodeInstance.update(options);
    }

    }

    // Barcode Generation
    function generateBarcode() {
        const barcodeDataInput = document.getElementById("barcode-data");
        const barcodeTypeSelect = document.getElementById("barcode-type");
        const barcodeDisplayValueCheckbox = document.getElementById("barcode-display-value");
        const data = barcodeDataInput.value;
        const type = barcodeTypeSelect.value;
        const displayValue = barcodeDisplayValueCheckbox.checked;

        barcodeDisplay.innerHTML = ''; // Clear previous barcode or error message

        if (!data) {
            return; // Don't generate if no data
        }

        try {
            JsBarcode(barcodeDisplay, data, {
                format: type,
                displayValue: displayValue,
                lineColor: "#000000",
                background: "#ffffff",
                width: 2, // Width of a single bar
                height: 100, // Height of the barcode
            });
        } catch (error) {
            console.error("Barcode generation error:", error);
            barcodeDisplay.innerHTML = `<p class="error-text" style="color: red; text-align: center;">বারকোড তৈরি করা যায়নি। অনুগ্রহ করে ডেটা এবং ফরম্যাট পরীক্ষা করুন। (${error.message})</p>`;
        }
    }

    // --- Download Functions ---
    function downloadQRCode(format) {
        if (qrCodeInstance && selectedQrType !== 'barcode' && getDataForType(selectedQrType)) {
            qrCodeInstance.download({ name: `qr-code-${selectedQrType}`, extension: format });
        } else {
            alert("কোনো QR কোড তৈরি হয়নি অথবা আপনি বারকোড ট্যাবে আছেন বা ডেটা প্রবেশ করাননি!");
        }
    }

    function downloadBarcode(format) {
        const barcodeSVG = barcodeDisplay.querySelector('svg'); // Get the SVG element generated by JsBarcode
        const barcodeData = document.getElementById("barcode-data").value || "barcode";

        if (barcodeSVG && selectedQrType === 'barcode' && getDataForType(selectedQrType)) {
            if (format === 'svg') {
                const svgData = new XMLSerializer().serializeToString(barcodeSVG);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(svgBlob);
                const downloadLink = document.createElement('a');
                downloadLink.href = svgUrl;
                downloadLink.download = `${barcodeData}.svg`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(svgUrl);
            } else { // PNG or JPG
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                const svgData = new XMLSerializer().serializeToString(barcodeSVG);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(svgBlob);

                img.onload = () => {
                    // Set canvas dimensions based on image, add some padding
                    const padding = 20; // Add some padding around the barcode
                    canvas.width = img.width + padding * 2;
                    canvas.height = img.height + padding * 2;
                    
                    ctx.fillStyle = "#ffffff"; // White background
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, padding, padding); // Draw image with padding
                    
                    const dataURL = canvas.toDataURL(`image/${format === 'jpeg' ? 'jpeg' : 'png'}`);
                    const downloadLink = document.createElement('a');
                    downloadLink.href = dataURL;
                    downloadLink.download = `${barcodeData}.${format}`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(svgUrl);
                };
                img.onerror = (err) => {
                    console.error("Error loading SVG for barcode conversion:", err);
                    alert("বারকোড ডাউনলোডে সমস্যা হয়েছে।");
                };
                img.src = svgUrl;
            }
        } else {
            alert("কোনো বারকোড তৈরি হয়নি অথবা আপনি QR কোড ট্যাবে আছেন বা ডেটা প্রবেশ করাননি!");
        }
    }

    // --- Event Listeners ---

    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    // Step 1: QR Type Selection
    qrTypeCards.forEach(card => {
        card.addEventListener('click', () => {
            activateQrType(card.dataset.type);
        });
    });

    // Step Navigation Buttons
    nextStepBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const stepToAdvance = parseInt(btn.dataset.step);
            if (stepToAdvance < 4) { // Max step is 4
                showStep(stepToAdvance + 1);
            }
        });
    });

    prevStepBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const stepToGoBack = parseInt(btn.dataset.step);
            if (stepToGoBack > 1) { // Min step is 1
                showStep(stepToGoBack - 1);
            }
        });
    });

    startOverBtn.addEventListener('click', () => {
        // Reset all inputs to their default values (simple approach)
        allInputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            } else {
                input.value = '';
            }
        });
        qrResolutionSlider.value = 500;
        resolutionDisplay.textContent = '500x500';
        document.getElementById("qr-color").value = '#000000';
        document.getElementById("qr-bg-color").value = '#ffffff';
        document.getElementById("qr-dot-style").value = 'square';
        document.getElementById("qr-corner-style").value = 'square';
        document.getElementById("qr-gradient-type").value = 'none';
        document.getElementById("qr-gradient-color1").value = '#000000';
        document.getElementById("qr-gradient-color2").value = '#000000';
        logoFile = null;
        logoUpload.value = ''; // Reset file input
        removeLogoBtn.style.display = 'none';

        // Clear existing QR/barcode
        if (qrCodeInstance) {
            qrCodeInstance.clear();
            qrCodeInstance = null;
        }
        barcodeDisplay.innerHTML = '';
        qrCodeContainer.innerHTML = ''; // Ensure canvas is cleared too
        
        initializeGenerator(); // Re-initialize to step 1 and default state
    });

    // Input changes trigger generation
    allInputs.forEach(input => {
        input.addEventListener('input', () => {
            generateCode(); // Call unified generation function
        });
        // Special case for color inputs and selects as they are 'input' but need immediate feedback
        if (input.type === 'color' || input.tagName === 'SELECT' || input.type === 'checkbox') {
            input.addEventListener('change', () => {
                generateCode(); // Call unified generation function
            });
        }
    });

    // Add event listeners for new currency selects
    if (bitcoinCurrency) { // Check if element exists before adding listener
        bitcoinCurrency.addEventListener('change', generateCode);
    }
    if (paypalCurrency) { // Check if element exists before adding listener
        paypalCurrency.addEventListener('change', generateCode);
    }

    // Debounce function for better performance on slider input
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // Modified qrResolutionSlider event listener to use debounce
    qrResolutionSlider.addEventListener('input', debounce(() => {
        resolutionDisplay.textContent = `${qrResolutionSlider.value}x${qrResolutionSlider.value}`;
        generateQRCode(); // Only QR code changes resolution
    }, 300)); // 300ms debounce delay

    // Logo Upload
    logoUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                logoFile = e.target.result;
                generateQRCode(); // Always generate QR code when logo is uploaded
                removeLogoBtn.style.display = 'inline-block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Remove Logo
    removeLogoBtn.addEventListener('click', () => {
        logoFile = null;
        logoUpload.value = ''; // Reset file input
        generateQRCode(); // Update QR code without logo
        removeLogoBtn.style.display = 'none';
    });

    // Download Buttons
    downloadPngBtn.addEventListener('click', () => {
        if (selectedQrType === 'barcode') {
            downloadBarcode('png');
        } else {
            downloadQRCode('png');
        }
    });

    downloadSvgBtn.addEventListener('click', () => {
        if (selectedQrType === 'barcode') {
            downloadBarcode('svg');
        } else {
            downloadQRCode('svg');
        }
    });

    downloadJpgBtn.addEventListener('click', () => {
        if (selectedQrType === 'barcode') {
            downloadBarcode('jpeg'); // Use 'jpeg' for JPG format
        } else {
            downloadQRCode('jpeg');
        }
    });

    // FAQ Modal
    showFaqBtn.addEventListener('click', () => {
        faqOverlay.classList.add('active');
    });

    faqCloseBtn.addEventListener('click', () => {
        faqOverlay.classList.remove('active');
    });

    faqOverlay.addEventListener('click', (e) => {
        if (e.target === faqOverlay) {
            faqOverlay.classList.remove('active');
        }
    });

    // Initial setup
    initializeGenerator();
});