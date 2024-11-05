// src/utils/tfidf.js

export class TfIdf {
  constructor() {
    this.documents = [];
    this.termCounts = {};
    this.docFrequencies = {};
    this.totalDocs = 0;
  }

  addDocument(doc) {
    console.log("Before adding document - total docs:", this.totalDocs);
    console.log("Adding document:", doc); 

    if (typeof doc !== 'string') {
      console.error("Error: doc is not a string. Received:", doc);
      doc = ""
      // return;
    }

    this.documents.push(doc);
    this.totalDocs++;
    console.log("After adding document - total docs:", this.totalDocs);
    console.log("doccccc:", doc);
    const terms = doc.split(/\W+/);
    const termCounts = {};

    console.log("terms:", terms);
    terms.forEach(term => {
      if (!termCounts[term]) {
        termCounts[term] = 0;
      }
      termCounts[term]++;
    });

    Object.keys(termCounts).forEach(term => {
      if (!this.termCounts[term]) {
        this.termCounts[term] = [];
      }
      this.termCounts[term].push(termCounts[term]);

      if (!this.docFrequencies[term]) {
        this.docFrequencies[term] = 0;
      }
      this.docFrequencies[term]++;
    });

    console.log("Terms in this document:", terms);
    console.log("Term counts:", termCounts);
    console.log("Document frequencies:", this.docFrequencies);
  }

  tf(term, doc) {
    console.log("computing term frequency in doccccc:", doc);

    if (typeof doc !== 'string') {
      console.error("Error: doc is not a string. Received:", doc);
      return 0;
    }

    const terms = doc.split(/\W+/);
    const termCount = terms.filter(t => t === term).length;
    console.log(`TF - term: "${term}", count in document: ${termCount}, total terms in document: ${terms.length}`);
    console.log("tf:", termCount / terms.length);
    return termCount / terms.length;
  }

  idf(term) {
    console.log("computing inverse document frequency for term:", term);
    console.log(`IDF - term: "${term}", document frequency: ${this.docFrequencies[term]}, total documents: ${this.totalDocs}`);
    console.log("idf:", Math.log(this.totalDocs / (this.docFrequencies[term])));
    console.log("idf: enable in tfidf.js to display (computes again)")
    console.log(`idf: math.log( "${this.totalDocs}"/"${this.docFrequencies[term]}")` );

    return Math.log(this.totalDocs / ( this.docFrequencies[term]));
  }

  tfidf(term, doc) {
    console.log("computing TF-IDF for term "+ term+ " in doc: "+ doc);
    const tfValue = this.tf(term, doc);
    const idfValue = this.idf(term);
    const tfidfValue = tfValue * idfValue;

    console.log(`TF-IDF - term: "${term}", TF: ${tfValue}, IDF: ${idfValue}, TF-IDF: ${tfidfValue}`);
    return tfidfValue;
  }
}