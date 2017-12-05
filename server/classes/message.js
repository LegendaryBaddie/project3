const Message = class Message {
  constructor(name, content, id) {
    this.name = name;
    this.content = content;
    this.id = id;
    this.stars = 0;
  }

  up() {
    this.stars++;
  }

  down() {
    this.stars--;
  }

  toOBJ() {
    const obj = {
      name: this.name,
      content: this.content,
      id: this.id,
      stars: this.stars,
    };
    return obj;
  }
};
module.exports.Message = Message;
