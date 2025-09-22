// Backup script voor het opslaan van huidige lessen data
// Voer dit uit in de browser console om een backup te maken

console.log('=== REBELS SPORTS LESSEN BACKUP ===');
console.log('Datum:', new Date().toLocaleString('nl-NL'));

// Haal huidige lessen op
const currentLessons = localStorage.getItem('rebelsClasses');
const currentReservations = localStorage.getItem('rebelsReservations');

if (currentLessons) {
  console.log('\n--- HUIDIGE LESSEN ---');
  const lessons = JSON.parse(currentLessons);
  console.log(`Aantal lessen: ${lessons.length}`);
  console.log('Lessen data:', lessons);
  
  // Maak downloadbare backup
  const backupData = {
    timestamp: new Date().toISOString(),
    lessons: lessons,
    reservations: currentReservations ? JSON.parse(currentReservations) : {}
  };
  
  const dataStr = JSON.stringify(backupData, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `rebels-sports-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log('✅ Backup bestand gedownload!');
} else {
  console.log('❌ Geen lessen gevonden om te backuppen');
}

// Functie om lessen te wissen (voer deze uit als je zeker weet dat je wilt wissen)
function clearAllLessons() {
  if (confirm('Weet je zeker dat je ALLE lessen wilt verwijderen? Dit kan niet ongedaan worden gemaakt!')) {
    localStorage.removeItem('rebelsClasses');
    localStorage.removeItem('rebelsReservations');
    console.log('✅ Alle lessen en reserveringen zijn gewist!');
    console.log('Herlaad de pagina om de wijzigingen te zien.');
  }
}

console.log('\n--- INSTRUCTIES ---');
console.log('1. Een backup is automatisch gedownload');
console.log('2. Om alle lessen te wissen, voer uit: clearAllLessons()');
console.log('3. Herlaad daarna de pagina');