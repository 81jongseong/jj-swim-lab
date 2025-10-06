const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/app/admin/health/overview/page.tsx');

// Read file
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`Total lines: ${lines.length}`);

// Find the duplicate section
let firstSectionStart = -1;
let firstSectionEnd = -1;
let secondSectionStart = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('센터/구/시도별 건강 분포 비교')) {
    if (firstSectionStart === -1) {
      firstSectionStart = i;
      console.log(`First section found at line ${i + 1}`);
    } else if (secondSectionStart === -1) {
      secondSectionStart = i;
      console.log(`Second section found at line ${i + 1}`);
      // The first section ends right before the second section
      firstSectionEnd = i - 1;
      break;
    }
  }
}

if (firstSectionStart !== -1 && firstSectionEnd !== -1 && secondSectionStart !== -1) {
  console.log(`\nRemoving lines ${firstSectionStart + 1} to ${firstSectionEnd + 1}`);
  console.log(`Preview of first line to remove: ${lines[firstSectionStart].substring(0, 80)}`);
  console.log(`Preview of last line to remove: ${lines[firstSectionEnd].substring(0, 80)}`);
  console.log(`Preview of line after removal: ${lines[secondSectionStart].substring(0, 80)}`);
  
  // Remove the duplicate section
  const newLines = [
    ...lines.slice(0, firstSectionStart),
    ...lines.slice(secondSectionStart)
  ];
  
  // Write back
  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log(`\n✅ Successfully removed ${firstSectionEnd - firstSectionStart + 1} lines`);
  console.log(`New total lines: ${newLines.length}`);
} else {
  console.log('\n❌ Could not find duplicate sections');
  console.log(`firstSectionStart: ${firstSectionStart}`);
  console.log(`firstSectionEnd: ${firstSectionEnd}`);
  console.log(`secondSectionStart: ${secondSectionStart}`);
}

