"use strict";

function processGroups() {
    const inputText = document.getElementById('groupInfo').value;
    const parser = new DOMParser();
    const doc = parser.parseFromString(inputText, 'text/html');
    
    const groupElements = doc.querySelectorAll('div._amif > div._amig > span._ao3e');
    const phoneElements = doc.querySelectorAll('div.x78zum5 span[title]');
    
    let csvContent = "Group Name,Number\n";
    let showDownloadButton = false;
    let validNumbersFound = false;
    let tableContent = "<table id='resultTable' class='table table-striped'><thead><tr><th>Group Name</th><th>Number</th></tr></thead><tbody>";

    groupElements.forEach((groupElement, index) => {
        const groupName = groupElement.textContent.trim().replace(/&nbsp;/g, ' ');
        const phoneNumbers = phoneElements[index].title.match(/\+?\d{1,4}[\s-]?\d{1,5}[\s-]?\d{3,5}[\s-]?\d{3,5}/g);

        if (phoneNumbers) {
            const uniqueNumbers = [...new Set(phoneNumbers.map(number => number.trim()))];

            if (uniqueNumbers.length > 0) {
                uniqueNumbers.forEach(number => {
                    csvContent += `${groupName},"${number}"\n`;
                    tableContent += `<tr><td>${groupName}</td><td>${number}</td></tr>`;
                });
                showDownloadButton = true;
                validNumbersFound = true;
            }
        }
    });

    tableContent += "</tbody></table>";

    if (validNumbersFound) {
        document.getElementById('resultTableContainer').innerHTML = tableContent;
        $('#resultTable').DataTable();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = url;
        downloadLink.style.display = 'inline';
        document.getElementById('message').innerText = 'Data processed successfully. Click the button below to download the CSV file.';
        $("#message").fadeIn().delay(2000).fadeOut();
        document.getElementById('resetButton').style.display = 'inline-block';
    } else {
        document.getElementById('message').innerText = 'No valid numbers found.';
        document.getElementById('resultTableContainer').innerHTML = '';
        document.getElementById('resetButton').style.display = 'none';
    }
    
}

function resetForm() {
    document.getElementById('groupForm').reset();
    document.getElementById('message').textContent = '';
    document.getElementById('resultTableContainer').innerHTML = '';
    document.getElementById('downloadLink').style.display = 'none';
    document.getElementById('resetButton').style.display = 'none'; // Hide the reset button
}

//---------------**** Large Number Extractor  Begin ****----------------------//

         // Function to extract phone numbers wrapped in HTML tags (worldwide)
         function extractPhoneNumbers(text) {
            const phoneRegex = /<span[^>]*>(\+?\d{1,3}[ -]?\(?\d{1,4}\)?[ -]?\d{1,4}[ -]?\d{1,4}[ -]?\d{1,4})<\/span>/g;
            let phoneNumbers = [];
            let match;
    
            while ((match = phoneRegex.exec(text)) !== null) {
                phoneNumbers.push(match[1]);
            }
    
            return phoneNumbers.length ? phoneNumbers : [];
        }
    
        // Function to download table data as CSV (including headers and data, without extra rows)
        function downloadCSV(csv, filename) {
            const csvFile = new Blob([csv], { type: "text/csv" });
            const downloadLink = document.createElement("a");
            downloadLink.download = filename;
            downloadLink.href = window.URL.createObjectURL(csvFile);
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
            downloadLink.click();
        }
    
        // Function to export the table data (excluding the "Chat WhatsApp" column)
        function exportTableToCSV(filename) {
            const table = $('#phoneTable').DataTable();
            let csv = [];
    
            // Fetch all data from the DataTable (not just the visible page)
            table.rows().every(function () {
                let rowData = [];
                $(this.node()).find('td').each(function (index) {
                    if (index < 2) { // We only want to export the first 2 columns: Group Name and Phone Number
                        rowData.push($(this).text());
                    }
                });
                csv.push(rowData.join(","));
            });
    
            // Add headers manually (without "Chat WhatsApp")
            let headers = ['Group Name', 'Phone Number'];
            csv.unshift(headers.join(",")); // Add headers to the top of CSV
    
            // Download the CSV file
            downloadCSV(csv.join("\n"), filename);
        }
    
        // Counter to track the current message index
        let messageCounter = 0;
    
        // Function to display phone numbers in the table
        function displayPhoneNumbers(groupName, numbers) {
            const tableBody = document.querySelector('#phoneTable tbody');
            tableBody.innerHTML = '';  // Clear the table before displaying new results
    
            numbers.forEach(number => {
                const row = document.createElement('tr');
                const groupCell = document.createElement('td');
                const phoneCell = document.createElement('td');
                const whatsappCell = document.createElement('td');
    
                // WhatsApp Join URL with alternating messages
                const joinWhatsAppLink = document.createElement('a');
                const currentMessage = whatsappMessages[messageCounter]; // Get the current message
                joinWhatsAppLink.href = `https://api.whatsapp.com/send?phone=${number.replace(/\D/g, '')}&text=${encodeURIComponent(currentMessage)}`;  // Add alternating message
                joinWhatsAppLink.target = "_blank";
                joinWhatsAppLink.className = "text-decoration-none";
                joinWhatsAppLink.innerHTML = '<span><img src="../assets/images/whatsapp.png" class="img-fluid" width="18px"/><span class="txt-wht">Send Whatsapp</span></span>';  // Set WhatsApp icon
    
                groupCell.textContent = groupName;  // Display group name
                phoneCell.textContent = number;  // Display phone number
                whatsappCell.appendChild(joinWhatsAppLink);  // Append Chat WhatsApp button
    
                row.appendChild(groupCell);
                row.appendChild(phoneCell);
                row.appendChild(whatsappCell);
                tableBody.appendChild(row);
    
                // Update the message counter for the next phone number
                messageCounter = (messageCounter + 1) % whatsappMessages.length;  // Loop through messages 1-5
            });
    
            // Show table, reset button, and CSV download button
            document.getElementById('phoneTable').classList.remove('hidden');
            document.getElementById('resetButtonnew').classList.remove('hidden');
            document.getElementById('downloadCSVButton').classList.remove('hidden');
    
            // Initialize or Reinitialize DataTable
            if ($.fn.DataTable.isDataTable('#phoneTable')) {
                $('#phoneTable').DataTable().clear().destroy();  // Destroy existing DataTable instance
            }
            $('#phoneTable').DataTable();  // Initialize DataTable
        }
    
        // Event listener for the Process button click
        document.getElementById('processButton').addEventListener('click', function () {
            const groupName = document.getElementById('group-name').value;
            const text = document.getElementById('inputText').value;
            const extractedNumbers = extractPhoneNumbers(text);
    
            if (groupName && extractedNumbers.length) {
                // Display the numbers in the table
                displayPhoneNumbers(groupName, extractedNumbers);
    
                // Display count
                document.getElementById('count').textContent = `Total Phone Numbers: ${extractedNumbers.length}`;
                document.getElementById('count').classList.remove('hidden');
            } else {
                alert('Please provide a group name and valid HTML content.');
            }
        });
    
        // Event listener for the Reset button click
        document.getElementById('resetButtonnew').addEventListener('click', function () {
            // Reset all input fields and hidden elements
            document.getElementById('group-name').value = '';
            document.getElementById('resetButtonnew').value = '';
            document.getElementById('inputText').value = '';
            document.getElementById('count').textContent = 'Total Phone Numbers: 0';
    
            // Hide table, count, reset button, and CSV download button after reset
            document.getElementById('phoneTable').classList.add('hidden');
            document.getElementById('resetButtonnew').classList.add('hidden');
            document.getElementById('count').classList.add('hidden');
            document.getElementById('downloadCSVButton').classList.add('hidden');
    
            // Clear the DataTable and its data
            if ($.fn.DataTable.isDataTable('#phoneTable')) {
                $('#phoneTable').DataTable().clear().destroy();  // Destroy existing DataTable instance
            }
    
            // Clear the table body
            document.querySelector('#phoneTable tbody').innerHTML = '';  
        });
    
        // Event listener for the Download CSV button click
        document.getElementById('downloadCSVButton').addEventListener('click', function () {
            exportTableToCSV("whatsapp_group_numbers_2.csv");
        });

        //---------------**** Large Number Extractor End ****----------------------//





  
