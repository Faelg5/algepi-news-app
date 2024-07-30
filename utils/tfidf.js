// src/utils/tfidf.js

export class TfIdf {
  constructor() {
    this.documents = [];
    this.termCounts = {};
    this.docFrequencies = {};
    this.totalDocs = 0;
  }
  addDocument(doc) {
    console.log("total docs:")
    console.log(this.totalDocs);
      console.log("TF IDF DATA: ");
      console.log(doc);
      this.documents.push(doc);
      this.totalDocs++;
      const terms = doc.split(/\W+/);
      const termCounts = {};
  
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
    }
  addDocument(doc) {
    this.documents.push(doc);
    this.totalDocs++;
    const terms = doc.split(/\W+/);
    const termCounts = {};

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
  }

  tf(term, doc) {
    const terms = doc.split(/\W+/);
    const termCount = terms.filter(t => t === term).length;
    return termCount / terms.length;
  }

  idf(term) {
    return Math.log(this.totalDocs / (1 + this.docFrequencies[term]));
  }

  tfidf(term, doc) {
    return this.tf(term, doc) * this.idf(term);
  }

}
