 class CertificateDto {

    filiere;
    desc_filiere;
    abbr_filiere;
    duree;
    fileName;
    date_obtained;
    title;
  
    constructor(data) {
        this.filiere = data.filiere.nom;
        this.desc_filiere = data.filiere.description;
        this.duree = data.filiere.duree;
        this.fileName = data.fileName;
        this.date_obtained = new Date(data.updatedAt).toLocaleDateString('fr-FR');
        this.title = data.filiere.diplome;
        this.abbr_filiere = data.filiere.abbr;
    }


}

module.exports = CertificateDto;

