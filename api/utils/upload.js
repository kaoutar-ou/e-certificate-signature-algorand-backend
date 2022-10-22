const fs = require("fs");
const ElementDeNote = require("../models/ElementDeNote");
const Filiere = require("../models/Filiere");

const excelEtudiantMissingRowNamesCheck = (row) => {
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

const excelEtudiantMissingRowValuesCheck = (row) => {
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
    //   "filiere",
  ];
  let rowErrors = [];
  rowNames.forEach((rowName) => {
    if (
      row[rowName] == null ||
      row[rowName] == "" ||
      row[rowName] == undefined
    ) {
      rowErrors.push(rowName);
    }
  });
  if (rowErrors.length == 0) {
    return true;
  } else {
    return false;
  }
};

const deleteFile = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      throw err;
    }
  });
};

const excelNoteMissingRowNamesCheck = (row) => {
  const excelNoteChecks = (row) => {
    const rowNames = [
      "code_apogee",
      "annee_universitaire",
      //   "filiere",
      "admis",
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
};

const excelNoteMissingRowValuesCheck = (row) => {
  const rowNames = [
    "code_apogee",
    "annee_universitaire",
    // "filiere",
    "admis",
  ];
  let rowErrors = [];
  rowNames.forEach((rowName) => {
    if (
      row[rowName] == null ||
      row[rowName] == "" ||
      row[rowName] == undefined
    ) {
      rowErrors.push(rowName);
    }
  });
  if (rowErrors.length == 0) {
    return true;
  } else {
    return false;
  }
};

const getNoteRow = async (row, filiereID) => {
  let excludedRowNames = [
    "code_apogee",
    "annee_universitaire",
    "filiere",
    "admis",
  ];
  let noteRow = {};
  let rowNames = Object.keys(row);

  await Promise.all(
    rowNames.map(async (rowName) => {
      let elementDeNote = null;
      let filiere = null;
      if (!excludedRowNames.includes(rowName)) {
        filiere = await Filiere.findOne({
          where: {
            id: filiereID,
          },
        });
        if (filiere != null && filiere != undefined) {
          elementDeNote = null;
          elementDeNote = await ElementDeNote.findOne(
            sequelize.fn("lower", sequelize.col("nom")),
            sequelize.fn("lower", rowName)
          );
          if (elementDeNote != null && elementDeNote != undefined) {
            semestre = await Semestre.findOne({
              _id: module.semestre,
              filiere: filiereID,
            });
            noteRow[elementDeNote.dataValues.id] = row[rowName];
          }
        }
      }
    })
  );
  console.log(noteRow);
  return noteRow;
};

module.exports = {
  excelEtudiantMissingRowNamesCheck,
  excelEtudiantMissingRowValuesCheck,
  deleteFile,
  excelNoteMissingRowNamesCheck,
  excelNoteMissingRowValuesCheck,
  getNoteRow,
};
