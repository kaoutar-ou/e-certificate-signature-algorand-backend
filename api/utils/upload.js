const excelEtudiantMissingRowsCheck = (row) => {
    const rowNames = [
      "cne",
      "code_apogee",
      "nom",
      "prenom",
      "cin",
      "date_naissance",
      "telephone",
      "adresse",
      "ville",
      "pays",
      "date_inscription",
      "filiere",
    ];
    let rowErrors = [];
    rowNames.forEach((rowName) => {
      if (!Object.keys(row).includes(rowName)) {
        rowErrors.push(rowName);
      }
    });
    if (rowErrors.length == 0) {
      return null;
    } else if (rowErrors.length == 1) {
      return "The field " + rowErrors[0] + " is missing";
    } else {
      return "The fields " + rowErrors.join(", ") + " are missing";
    }
  };

  module.exports = {
    excelEtudiantMissingRowsCheck,
    };