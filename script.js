// function to make navbar fixed
document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.querySelector('.navbar'); // Select the navbar
    const headerHeight = document.querySelector('.header').offsetHeight; // Get header height

    window.addEventListener('scroll', function () {
        if (window.scrollY > headerHeight) {
            navbar.classList.add('fixed-top'); // Add class when scrolled past header
            document.body.classList.add('fixed-nav'); // Add padding to body
        } else {
            navbar.classList.remove('fixed-top'); // Remove class when above header
            document.body.classList.remove('fixed-nav'); // Remove padding from body
        }
    });
});

// Object to store selected items
let selectedItems = {};

// Function to update selected items whenever a checkbox is clicked or quantity/unit changes
function updateSelectedItems(itemId) {
    const checkbox = document.getElementById(itemId);
    const quantity = document.getElementById(`quantity-${itemId}`).value;
    const unit = document.getElementById(`unit-${itemId}`).value;

    if (checkbox.checked) {
        selectedItems[itemId] = {
            quantity: quantity || 1,
            unit: unit || 'g'
        };
    } else {
        delete selectedItems[itemId];
    }
    
    console.log(selectedItems); // For debugging; shows updated list of selected items
}

// Auto-check the checkbox when quantity is entered
function autoCheck(itemId) {
const checkbox = document.getElementById(itemId);
const quantity = document.getElementById(`quantity-${itemId}`).value;

if (quantity) {
    checkbox.checked = true;
    updateSelectedItems(itemId);
} else {
    checkbox.checked = false;
    updateSelectedItems(itemId);
}
}


// Handle form submission
document.getElementById("submitBtn").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent default form submission

    // Open the modal to choose file format
    var myModal = new bootstrap.Modal(document.getElementById('fileChoiceModal'), {});
    myModal.show();
});

// Handle PDF generation
document.getElementById("generatePdf").addEventListener("click", function() {
    generatePDF(); // Call the function to generate the PDF
    closeModal();
});

// Handle Excel generation
document.getElementById("generateExcel").addEventListener("click", function() {
    generateExcel(); // Call the function to generate the Excel
    closeModal();
});

// Close the modal after selection
function closeModal() {
    var myModal = bootstrap.Modal.getInstance(document.getElementById('fileChoiceModal'));
    myModal.hide();
}




function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Constants for A4 page dimensions
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    // Define header and watermark text
    const headerText = "GUPTA CATERING DELIGHT";
    const locationText = "Ludhiana 9814035730";
    const watermarkText = "GUPTA 9814035730";

    // Function to add watermark in the background
    function addWatermarks() {
        doc.setTextColor(220); // Very light gray color for watermark
        doc.setFontSize(30); // Large font size for watermark

        // Place multiple watermarks diagonally on the page
        const watermarkPositions = [
            { x: pageWidth * 0.5, y: pageHeight * 0.4 },
            { x: pageWidth * 0.5, y: pageHeight * 0.7 },
            { x: pageWidth * 0.5, y: pageHeight * 1.0 }
        ];
        watermarkPositions.forEach(pos => {
            doc.text(watermarkText, pos.x, pos.y, { align: 'center', angle: 45 });
        });
        doc.setTextColor(0); // Reset color for main content
    }

    // Function to add centered header with styling
    function addHeader() {
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 150); // Dark blue color for the header
        doc.text(headerText, pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80); // Gray color for location
        doc.text(locationText, pageWidth / 2, 23, { align: 'center' });
        doc.setTextColor(0); // Reset color for other text
    }

    // Get form data
    const functionDate = document.getElementById("functionDate").value;
    const place = document.getElementById("place").value;
    const totalMembers = document.getElementById("totalMembers").value;
    const menu = document.getElementById("menu").value;

    // Add watermark and header to the first page
    addWatermarks();
    addHeader();

    // Add form data to PDF
    doc.text("Function Date:    " + functionDate, 10, 40);
    doc.text("Place:            " + place, 10, 50);
    doc.text("Total Members:    " + totalMembers, 10, 60);
    doc.text("Menu:             " + menu, 10, 70);

    // Add the menu list items
    const menuItems = getMenuItems();
    let yOffset = 90; // Start adding the menu items from a specific position

    // Raw Material List - Centered title
    const titleText = "------------Raw Material List------------";
    const titleWidth = doc.getTextWidth(titleText);
    const xOffset = (pageWidth - titleWidth) / 2;
    doc.text(titleText, xOffset, yOffset);

    yOffset += 10; // Space after the heading
    let itemNumber = 1; // Start item numbering

    menuItems.forEach(item => {
        const itemText = `${itemNumber}. ${item.item}`;
        const quantityText = ` ${item.quantity} ${item.unit}`;
        const dashPosition = 120; // Position for alignment

        // Check if we need a new page
        if (yOffset + 10 > pageHeight) {
            doc.addPage(); // Add a new page
            yOffset = 30;  // Reset yOffset for the new page
            
            // Add watermark and header for each new page
            addWatermarks();
            addHeader();
        }

        // Add item text
        doc.text(itemText, 10, yOffset);

        // Add the dash at a fixed position
        doc.text(' -', dashPosition, yOffset);

        // Add quantity after the dash
        doc.text(quantityText, 12 + dashPosition, yOffset);

        // Increment yOffset and item number
        yOffset += 10;
        itemNumber++;
    });

    // Save the PDF
    doc.save("catering-details.pdf");
}







function generateExcel() {
    // Get form data
    const functionDate = document.getElementById("functionDate").value;
    const place = document.getElementById("place").value;
    const totalMembers = document.getElementById("totalMembers").value;
    const menu = document.getElementById("menu").value;

    // Get selected menu items
    const menuItems = getMenuItems();

    // Create an array to hold all data for Excel
    const data = [{
        "Function Date": functionDate,
        "Place": place,
        "Total Members": totalMembers,
        "Menu": menu
    }];

    // Add an empty row after the initial form data for spacing
    data.push({});

    // Add the column headers for the Raw Material List
    data.push({
        "S.No": "S.No",
        "Item": "Item",
        "Details": "Details"
    });

    // Add each selected menu item to the data with S.No, Item, and Details
    menuItems.forEach((item, index) => {
        data.push({
            "S.No": index + 1, // Serial number (starting from 1)
            "Item": item.item,
            "Details": `${item.quantity} ${item.unit}` // Merged quantity and unit
        });
    });

    // Create a worksheet from the data
    const ws = XLSX.utils.json_to_sheet(data, { header: ["S.No", "Item", "Details"], skipHeader: false });

    // Add cell styles for better formatting
    const wscols = [
        { wch: 10 }, // Adjust width of the 'S.No' column
        { wch: 30 }, // Adjust width of the 'Item' column
        { wch: 20 }, // Adjust width of the 'Details' column
    ];
    ws['!cols'] = wscols;

    // Apply wrapping to the 'Details' column to prevent text overflow
    for (let row = 4; row <= data.length; row++) { // Start from row 4 to skip headers
        const cellAddress = `C${row}`; // Column C corresponds to 'Details'
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
            alignment: { vertical: "center", horizontal: "left", wrapText: true } // Text wrapping
        };
    }

    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Catering Details");

    // Save the Excel file
    XLSX.writeFile(wb, "catering-details.xlsx");
}






function getMenuItems() {
    const menuItems = [];
    // Loop through all the product rows (checkboxes and quantities)
    const productRows = document.querySelectorAll(".product-row");
    productRows.forEach(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        const label = row.querySelector('label');
        const quantityInput = row.querySelector('input[type="number"]');
        const unitSelect = row.querySelector('select');
        
        // Only add to the list if the checkbox is checked
        if (checkbox.checked) {
            const quantity = quantityInput ? quantityInput.value : "N/A";  // Default to "N/A" if no quantity is given
            const unit = unitSelect ? unitSelect.value : ""; // Get unit if present
            menuItems.push({ item: label.textContent, quantity, unit });
        }
    });
    return menuItems;
}
