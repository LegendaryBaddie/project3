const Question = class Question {
  constructor(id, content) {
    this.id = id;
    this.content = content;
    this.time = 60000;
  }
  updateTime() {
    this.time -= 500;
  }
};
module.exports.Question = Question;
module.exports.updateTime = Question.updateTime;
