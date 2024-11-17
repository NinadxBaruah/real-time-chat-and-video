function downloadResume() {
    // Trigger the download of the PDF file
    const link = document.createElement('a');
    link.href = '/pdf/ninad_baruah_resume.pdf'; // Path to your PDF
    link.download = 'Ninad_Baruah_Resume.pdf'; // File name when downloaded
    link.click();
  }