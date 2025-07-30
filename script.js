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
    const previewWrapper = document.querySelector('.qr-preview-wrapper');

    // Form Inputs & Controls
    const allInputs = document.querySelectorAll('.input-form input, .input-form textarea, .input-form select, .design-options-grid input, .design-options-grid select');
    const qrResolutionSlider = document.getElementById("qr-resolution");
    const resolutionDisplay = document.getElementById("resolution-display");
    const logoUpload = document.getElementById("logo-upload");
    const removeLogoBtn = document.getElementById("remove-logo");
    
    // Barcode Elements
    const barcodeTypeSelect = document.getElementById("barcode-type");
    const barcodeDataInput = document.getElementById("barcode-data");
    const barcodeQualitySlider = document.getElementById("barcode-quality");
    const barcodeQualityDisplay = document.getElementById("barcode-quality-display");

    // New Default Icons
    const defaultIcons = document.querySelectorAll(".default-icon");

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

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById("dark-mode-toggle");

    let currentStep = 1;
    let selectedQrType = 'text-url';
    let logoFile = null;
    let qrCodeInstance = null;

    // --- Dark Mode Logic ---
    function setDarkMode(isDark) {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }

    function toggleDarkMode() {
        const currentTheme = localStorage.getItem('theme');
        setDarkMode(currentTheme !== 'dark');
    }

    // --- Initialization ---
    function initializeGenerator() {
        // Apply saved theme on page load
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (savedTheme === null && systemPrefersDark)) {
            setDarkMode(true);
        } else {
            setDarkMode(false);
        }

        showStep(currentStep);
        updateStepIndicators();
        activateQrType('text-url');
        updateBarcodePlaceholder(); // Set initial placeholder
        generateCode(); 
        removeLogoBtn.style.display = 'none';
    }
    
    // --- UI Control Functions ---
    function updateDesignOptionsVisibility(type) {
        const qrDesignElements = document.querySelectorAll('.qr-design-option');
        const logoGroup = document.getElementById('logo-design-group');
        const designStepTitle = document.querySelector('#step-3 h2');

        if (type === 'barcode') {
            qrDesignElements.forEach(el => el.classList.add('hidden'));
            if (logoGroup) logoGroup.classList.add('hidden'); // Hide logo for barcode
            if (designStepTitle) designStepTitle.textContent = '৩. আপনার বারকোড ডিজাইন করুন';
        } else {
            qrDesignElements.forEach(el => el.classList.remove('hidden'));
            if (logoGroup) logoGroup.classList.remove('hidden'); // Show logo for QR
            if (designStepTitle) designStepTitle.textContent = '৩. আপনার QR কোড ডিজাইন করুন';
        }
    }

    function updatePreviewBoxStyle(type) {
        if (type === 'barcode') {
            previewWrapper.classList.add('barcode-mode');
        } else {
            previewWrapper.classList.remove('barcode-mode');
        }
    }

    // --- Barcode Placeholder Logic ---
    function updateBarcodePlaceholder() {
        const selectedType = barcodeTypeSelect.value;
        let placeholderText = "বারকোডের ডেটা লিখুন";
        switch (selectedType) {
            case 'CODE128':
                placeholderText = "যেকোনো ডেটা লিখুন";
                break;
            case 'EAN13':
                placeholderText = "১২ বা ১৩ সংখ্যার ডিজিট (যেমন: 123456789012)";
                break;
            case 'UPC':
                placeholderText = "১১ বা ১২ সংখ্যার ডিজিট (যেমন: 12345678901)";
                break;
            case 'CODE39':
                placeholderText = "বড় হাতের অক্ষর, সংখ্যা, স্পেস ব্যবহার করুন";
                break;
            case 'ITF14':
                placeholderText = "১৪ সংখ্যার ডিজিট (যেমন: 12345678901234)";
                break;
            case 'MSI':
                placeholderText = "শুধুমাত্র সংখ্যা ব্যবহার করুন";
                break;
            case 'Pharmacode':
                placeholderText = "৩ থেকে ১৩১০৭০ এর মধ্যে একটি সংখ্যা";
                break;
        }
        barcodeDataInput.placeholder = placeholderText;
    }

    // --- Step Navigation Logic ---
    function showStep(stepNum) {
        stepPanels.forEach(panel => panel.classList.remove('active'));
        document.getElementById(`step-${stepNum}`).classList.add('active');
        currentStep = stepNum;
        updateStepIndicators();
        updatePreviewVisibility();
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

        const stepLines = document.querySelectorAll('.step-line');
        stepLines.forEach((line, index) => {
            if (index + 2 <= currentStep) {
                line.style.background = 'linear-gradient(90deg, var(--primary-green), var(--primary-blue))';
            } else {
                line.style.background = 'var(--border-light)';
            }
        });
    }

    // --- QR Type Selection Logic ---
    function activateQrType(type) {
        qrTypeCards.forEach(card => card.classList.remove('active'));
        const selectedCard = document.querySelector(`.qr-type-card[data-type="${type}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
            selectedQrType = type;
            showDataInputTab(type);
            updateDesignOptionsVisibility(type);
            updatePreviewBoxStyle(type); 
            generateCode(); 
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
        updatePreviewVisibility(); 
    }

    // --- Preview Panel Control ---
    function updatePreviewVisibility() {
        const hasData = getDataForType(selectedQrType);
        
        if (currentStep < 2 || !hasData) {
            qrCodeContainer.style.display = 'none';
            barcodeDisplay.style.display = 'none';
            previewPlaceholderText.style.display = 'block';
        } else {
            previewPlaceholderText.style.display = 'none';
            if (selectedQrType === 'barcode') {
                qrCodeContainer.style.display = 'none';
                barcodeDisplay.style.display = 'block';
            } else {
                qrCodeContainer.style.display = 'flex';
                barcodeDisplay.style.display = 'none';
            }
        }
    }

    // --- Data Gathering ---
    function getDataForType(type) {
        let data = "";
        switch (type) {
            case 'text-url':
                data = document.getElementById("text-url-input").value;
                break;
            case 'bkash':
                const bkashNumber = document.getElementById("bkash-number").value.replace(/\D/g, '');
                if (!bkashNumber) return "";
                const bkashAmount = document.getElementById("bkash-amount").value;
                const bkashReference = document.getElementById("bkash-reference").value;
                
                const payload = [
                    '000201',
                    '010212',
                    '26' + (33 + bkashNumber.length).toString().padStart(2, '0'),
                        '0004com.',
                        '0105bkash',
                        '02' + bkashNumber.length.toString().padStart(2, '0') + bkashNumber,
                    '52040000',
                    '5303050',
                ];

                if (bkashAmount) {
                    const amountStr = parseFloat(bkashAmount).toFixed(2);
                    payload.push('54' + amountStr.length.toString().padStart(2, '0') + amountStr);
                }
                
                if (bkashReference) {
                    const refStr = bkashReference.replace(/[^a-zA-Z0-9]/g, ''); // Alphanumeric ref
                     if(refStr){
                        payload.push('05' + refStr.length.toString().padStart(2, '0') + refStr);
                     }
                }
                
                payload.push('5802BD');
                payload.push('62' + ('07' + 'QrSheba'.length).toString().padStart(2, '0') + '0107QrSheba'); // Bill Number
                payload.push('6304');

                const payloadString = payload.join('');
                const crc = calculateCRC16(payloadString).toString(16).toUpperCase().padStart(4, '0');
                
                data = payloadString + crc;
                break;

            case 'nagad':
                const nagadNumber = document.getElementById("nagad-number").value.replace(/\D/g, '');
                if (!nagadNumber) return "";
                const nagadAmount = document.getElementById("nagad-amount").value;
                
                const nagadPayload = [
                    '000201',
                    '010212',
                    '26' + (32 + nagadNumber.length).toString().padStart(2, '0'),
                        '0004com.',
                        '0105nagad',
                        '02' + nagadNumber.length.toString().padStart(2, '0') + nagadNumber,
                    '52040000',
                    '5303050',
                ];

                if (nagadAmount) {
                    const amountStr = parseFloat(nagadAmount).toFixed(2);
                    nagadPayload.push('54' + amountStr.length.toString().padStart(2, '0') + amountStr);
                }
                
                nagadPayload.push('5802BD');
                nagadPayload.push('6304');

                const nagadPayloadString = nagadPayload.join('');
                const nagadCrc = calculateCRC16(nagadPayloadString).toString(16).toUpperCase().padStart(4, '0');

                data = nagadPayloadString + nagadCrc;
                break;
            case 'wifi':
                const ssid = document.getElementById("wifi-ssid").value;
                if (!ssid) return "";
                const password = document.getElementById("wifi-password").value;
                const encryption = document.getElementById("wifi-encryption").value;
                const hidden = document.getElementById("wifi-hidden").checked;
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

                if (!firstName && !lastName && !organization && !title && !phone && !email && !address && !website) return "";
                
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
                if (!emailTo) return "";
                const emailSubject = encodeURIComponent(document.getElementById("email-subject").value);
                const emailBody = encodeURIComponent(document.getElementById("email-body").value);
                data = `mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`;
                break;
            case 'sms':
                const smsPhone = document.getElementById("sms-phone").value;
                if (!smsPhone) return "";
                const smsMessage = encodeURIComponent(document.getElementById("sms-message").value);
                data = `SMSTO:${smsPhone}:${smsMessage}`;
                break;
            case 'phone':
                data = `tel:${document.getElementById("phone-number").value}`;
                break;
            case 'location':
                const latitude = document.getElementById("location-latitude").value;
                const longitude = document.getElementById("location-longitude").value;
                if (!latitude || !longitude) return "";
                data = `geo:${latitude},${longitude}`;
                break;
            case 'event':
                const eventTitle = document.getElementById("event-title").value;
                if (!eventTitle) return "";
                const eventLocation = encodeURIComponent(document.getElementById("event-location").value);
                const eventStartInput = document.getElementById("event-start").value;
                const eventEndInput = document.getElementById("event-end").value;
                const eventDescription = encodeURIComponent(document.getElementById("event-description").value);

                let eventStart = '', eventEnd = '';

                if (eventStartInput) {
                    const dateObj = new Date(eventStartInput);
                    if (!isNaN(dateObj.getTime())) {
                        eventStart = dateObj.toISOString().replace(/[-:]|\.\d{3}/g, '').split('.')[0] + 'Z';
                    }
                }
                if (eventEndInput) {
                    const dateObj = new Date(eventEndInput);
                    if (!isNaN(dateObj.getTime())) {
                        eventEnd = dateObj.toISOString().replace(/[-:]|\.\d{3}/g, '').split('.')[0] + 'Z';
                    }
                }

                data = `BEGIN:VEVENT\nSUMMARY:${encodeURIComponent(eventTitle)}\nLOCATION:${eventLocation}\n`;
                if (eventStart) data += `DTSTART:${eventStart}\n`;
                if (eventEnd) data += `DTEND:${eventEnd}\n`;
                if (eventDescription) data += `DESCRIPTION:${eventDescription}\n`;
                data += `END:VEVENT`;
                break;
            case 'paypal':
                const paypalEmail = document.getElementById("paypal-email").value;
                if (!paypalEmail) return "";
                const paypalAmount = document.getElementById("paypal-amount").value;
                const paypalItem = encodeURIComponent(document.getElementById("paypal-item").value);
                const selectedPaypalCurrency = paypalCurrency.value;
                data = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(paypalEmail)}`;
                if (paypalAmount) data += `&amount=${encodeURIComponent(paypalAmount)}`;
                data += `¤cy_code=${encodeURIComponent(selectedPaypalCurrency)}`;
                if (paypalItem) data += `&item_name=${paypalItem}`;
                break;
            case 'bitcoin':
                const bitcoinAddress = document.getElementById("bitcoin-address").value;
                if (!bitcoinAddress) return "";
                const bitcoinAmount = document.getElementById("bitcoin-amount").value;
                const bitcoinMessage = encodeURIComponent(document.getElementById("bitcoin-message").value);
                
                let bitcoinData = `bitcoin:${bitcoinAddress}`;
                const params = [];
                if (bitcoinAmount) params.push(`amount=${bitcoinAmount}`);
                if (bitcoinMessage) params.push(`message=${bitcoinMessage}`);
                if (params.length > 0) bitcoinData += `?${params.join('&')}`;
                data = bitcoinData;
                break;
            case 'app-download':
                const androidUrl = document.getElementById("app-android-url").value;
                const iosUrl = document.getElementById("app-ios-url").value;
                if (!androidUrl && !iosUrl) return "";
                data = androidUrl || iosUrl;
                break;
            case 'barcode':
                data = document.getElementById("barcode-data").value;
                break;
        }
        return data;
    }

    // --- Code Generation ---
    function generateQRCode() {
        const data = getDataForType(selectedQrType);
        
        if (!data) {
            if (qrCodeInstance) {
                qrCodeInstance.clear();
                qrCodeInstance = null;
            }
            qrCodeContainer.innerHTML = '';
            return;
        }

        const options = {
            width: parseInt(qrResolutionSlider.value),
            height: parseInt(qrResolutionSlider.value),
            data: data,
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
            const gradientOptions = {
                type: gradientType, rotation: 0, colorStops: gradientColors
            };
            options.dotsOptions.gradient = gradientOptions;
            options.cornersSquareOptions.gradient = gradientOptions;
            options.cornersDotOptions.gradient = gradientOptions;
        } else {
            delete options.dotsOptions.gradient;
            delete options.cornersSquareOptions.gradient;
            delete options.cornersDotOptions.gradient;
        }

        if (!qrCodeInstance) {
            qrCodeInstance = new QRCodeStyling(options);
            qrCodeContainer.innerHTML = '';
            qrCodeInstance.append(qrCodeContainer);
       } else {
            qrCodeInstance.update(options);
       }
    }

    function generateBarcode() {
        const data = barcodeDataInput.value;
        barcodeDisplay.innerHTML = '';

        if (!data) {
            return;
        }
        
        const barcodeDisplayValueCheckbox = document.getElementById("barcode-display-value");
        const barcodeWidthInput = document.getElementById("barcode-width");
        const barcodeHeightInput = document.getElementById("barcode-height");
        const barcodeLineColorInput = document.getElementById("barcode-line-color");
        const barcodeBgColorInput = document.getElementById("barcode-bg-color");

        try {
            JsBarcode(barcodeDisplay, data, {
                format: barcodeTypeSelect.value,
                displayValue: barcodeDisplayValueCheckbox.checked,
                lineColor: barcodeLineColorInput.value,
                background: barcodeBgColorInput.value,
                width: parseInt(barcodeWidthInput.value, 10),
                height: parseInt(barcodeHeightInput.value, 10),
                margin: 10
            });
        } catch (error) {
            console.error("Barcode generation error:", error);
            barcodeDisplay.innerHTML = `<p class="error-text" style="color: red; text-align: center;">বারকোড তৈরি করা যায়নি। অনুগ্রহ করে ডেটা এবং ফরম্যাট পরীক্ষা করুন।</p>`;
        }
    }

    // --- Download Functions ---
    function downloadQRCode(format) {
        if (qrCodeInstance && selectedQrType !== 'barcode' && getDataForType(selectedQrType)) {
            qrCodeInstance.download({ name: `qrsheba-${selectedQrType}`, extension: format });
        } else {
            alert("কোনো QR কোড তৈরি হয়নি অথবা ডেটা প্রবেশ করানো হয়নি!");
        }
    }

    function downloadBarcode(format) {
        const barcodeSVG = barcodeDisplay;
        const barcodeData = document.getElementById("barcode-data").value || "barcode";
        const qualityMultiplier = parseInt(barcodeQualitySlider.value, 10);

        if (barcodeSVG && barcodeSVG.hasChildNodes() && selectedQrType === 'barcode' && getDataForType(selectedQrType)) {
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
                    const padding = 20 * qualityMultiplier;
                    const imgWidth = img.width;
                    const imgHeight = img.height;

                    canvas.width = (imgWidth * qualityMultiplier) + (padding * 2);
                    canvas.height = (imgHeight * qualityMultiplier) + (padding * 2);
                    
                    ctx.fillStyle = document.getElementById("barcode-bg-color").value || "#ffffff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    ctx.drawImage(img, padding, padding, imgWidth * qualityMultiplier, imgHeight * qualityMultiplier); 
                    
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
            alert("কোনো বারকোড তৈরি হয়নি অথবা ডেটা প্রবেশ করানো হয়নি!");
        }
    }

    // --- Event Listeners ---
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
    
    // Dark Mode Listener
    darkModeToggle.addEventListener('click', toggleDarkMode);

    menuToggle.addEventListener('click', () => mainNav.classList.toggle('active'));

    qrTypeCards.forEach(card => card.addEventListener('click', () => activateQrType(card.dataset.type)));

    nextStepBtns.forEach(btn => btn.addEventListener('click', () => {
        if (currentStep < 4) showStep(currentStep + 1);
    }));

    prevStepBtns.forEach(btn => btn.addEventListener('click', () => {
        if (currentStep > 1) showStep(currentStep - 1);
    }));

    startOverBtn.addEventListener('click', () => {
        allInputs.forEach(input => {
            if (input.type === 'checkbox') input.checked = false;
            else if (input.tagName === 'SELECT') input.selectedIndex = 0;
            else input.value = '';
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

        if(document.getElementById('barcode-width')) {
            document.getElementById('barcode-width').value = 2;
            document.getElementById('barcode-height').value = 100;
            document.getElementById('barcode-line-color').value = '#000000';
            document.getElementById('barcode-bg-color').value = '#ffffff';
            document.getElementById('barcode-display-value').checked = true;
        }
        if (barcodeQualitySlider) {
            barcodeQualitySlider.value = 1;
            barcodeQualityDisplay.textContent = '1x';
        }

        logoFile = null;
        logoUpload.value = '';
        removeLogoBtn.style.display = 'none';
        defaultIcons.forEach(icon => icon.classList.remove('selected'));

        if (qrCodeInstance) {
            qrCodeInstance.clear();
            qrCodeInstance = null;
        }
        barcodeDisplay.innerHTML = '';
        qrCodeContainer.innerHTML = '';
        
        initializeGenerator();
    });

    allInputs.forEach(input => {
        const eventType = (input.type === 'color' || input.tagName === 'SELECT' || input.type === 'checkbox') ? 'change' : 'input';
        input.addEventListener(eventType, debounce(generateCode, 200));
    });

    barcodeTypeSelect.addEventListener('change', () => {
        updateBarcodePlaceholder();
        generateCode();
    });

    qrResolutionSlider.addEventListener('input', debounce(() => {
        resolutionDisplay.textContent = `${qrResolutionSlider.value}x${qrResolutionSlider.value}`;
        generateQRCode();
    }, 200));

    if (barcodeQualitySlider) {
        barcodeQualitySlider.addEventListener('input', () => {
            barcodeQualityDisplay.textContent = `${barcodeQualitySlider.value}x`;
        });
    }

    logoUpload.addEventListener('change', (event) => {
        defaultIcons.forEach(icon => icon.classList.remove('selected'));
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                logoFile = e.target.result;
                generateQRCode();
                removeLogoBtn.style.display = 'inline-block';
            };
            reader.readAsDataURL(file);
        }
    });

    removeLogoBtn.addEventListener('click', () => {
        defaultIcons.forEach(icon => icon.classList.remove('selected'));
        logoFile = null;
        logoUpload.value = '';
        generateQRCode();
        removeLogoBtn.style.display = 'none';
    });

    defaultIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            defaultIcons.forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
            logoUpload.value = ''; 
            removeLogoBtn.style.display = 'inline-block';
            const iconPath = icon.dataset.iconPath;
            logoFile = iconPath;
            generateQRCode();
        });
    });

    downloadPngBtn.addEventListener('click', () => {
        if (selectedQrType === 'barcode') downloadBarcode('png');
        else downloadQRCode('png');
    });

    downloadSvgBtn.addEventListener('click', () => {
        if (selectedQrType === 'barcode') downloadBarcode('svg');
        else downloadQRCode('svg');
    });

    downloadJpgBtn.addEventListener('click', () => {
        if (selectedQrType === 'barcode') downloadBarcode('jpeg');
        else downloadQRCode('jpeg');
    });

    showFaqBtn.addEventListener('click', () => faqOverlay.classList.add('active'));
    faqCloseBtn.addEventListener('click', () => faqOverlay.classList.remove('active'));
    faqOverlay.addEventListener('click', (e) => {
        if (e.target === faqOverlay) faqOverlay.classList.remove('active');
    });

    // Initial setup
    initializeGenerator();

    // --- Global Voice Input (AI) to Auto-Generate QR ---
    const globalVoiceBtn = document.getElementById("global-voice-btn");
    const globalVoiceStatus = document.getElementById("global-voice-status");
    const textUrlInputForGlobal = document.getElementById("text-url-input");
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const globalRecognition = new SpeechRecognition();
        globalRecognition.continuous = false;
        globalRecognition.lang = 'bn-BD'; // Default to Bengali, but supports others
        globalRecognition.interimResults = false;
        globalRecognition.maxAlternatives = 1;

        globalVoiceBtn.addEventListener("click", () => {
            if (globalVoiceBtn.classList.contains('listening')) {
                globalRecognition.stop();
                return;
            }
            try {
                globalRecognition.start();
            } catch (error) {
                console.error("Could not start recognition:", error);
                globalVoiceStatus.textContent = "ভয়েস সার্ভিস শুরু করা যায়নি। ব্রাউজার পারমিশন চেক করুন।";
            }
        });

        globalRecognition.onstart = () => {
            globalVoiceBtn.classList.add("listening");
            globalVoiceStatus.textContent = "শুনছি... আপনার কাঙ্ক্ষিত টেক্সট বলুন।";
        };

        globalRecognition.onend = () => {
            globalVoiceBtn.classList.remove("listening");
            globalVoiceStatus.textContent = "";
        };

        globalRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;

            // 1. Activate the 'text-url' type automatically
            activateQrType('text-url');

            // 2. Set the input value
            textUrlInputForGlobal.value = transcript;

            // 3. Generate the QR Code
            generateCode();

            // 4. Automatically move to the design step (Step 3) to show the result
            showStep(3);

            globalVoiceStatus.textContent = `"${transcript}"-এর জন্য QR কোড তৈরি হয়েছে!`;
        };

        globalRecognition.onerror = (event) => {
            console.error("Global Speech recognition error:", event.error);
            globalVoiceBtn.classList.remove("listening");
            if (event.error === 'no-speech') {
                globalVoiceStatus.textContent = "কোনো কথা শোনা যায়নি। আবার চেষ্টা করুন।";
            } else if (event.error === 'not-allowed') {
                globalVoiceStatus.textContent = "মাইক্রোফোন ব্যবহারের অনুমতি প্রয়োজন।";
            } else {
                globalVoiceStatus.textContent = "দুঃখিত, একটি সমস্যা হয়েছে।";
            }
        };

    } else {
        console.warn("Speech Recognition not supported in this browser.");
        if(document.querySelector('.global-voice-container')) {
            document.querySelector('.global-voice-container').style.display = 'none'; // Hide the feature if not supported
        }
    }
});

// Helper function to calculate CRC16 checksum for Bangla QR
function calculateCRC16(data) {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
        }
    }
    return crc & 0xFFFF;
}