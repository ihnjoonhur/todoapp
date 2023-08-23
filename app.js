const mongodb = require('mongodb');
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
const serverless = require('serverless-http');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://ihnjoonh:mudda@todoapp.gughhae.mongodb.net", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const defaultItems = [
  { name: "Welcome to the todolist app!"},
  { name: "Hit the + button to add a new item." },
  { name: "Click the box to delete an item." }
];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", async (req, res) => {
  const foundItems = await Item.find({});

  if (foundItems.length === 0) {
    await Item.insertMany(defaultItems);
    return res.redirect("/");
  }

  res.render("list", { listTitle: "Today", newListItems: foundItems });
});

app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  const foundList = await List.findOne({ name: customListName });

  if (!foundList) {
    const list = new List({
      name: customListName,
      items: defaultItems
    });
    await list.save();
    res.redirect("/" + customListName);
  } else {
    res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
  }
});

app.post("/", async (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    await item.save();
    res.redirect("/");
  } else {
    const foundList = await List.findOne({ name: listName });
    foundList.items.push(item);
    await foundList.save();
    res.redirect("/" + listName);
  }
});

app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    await Item.findByIdAndRemove(checkedItemId);
    res.redirect("/");
  } else {
    await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } });
    res.redirect("/" + listName);
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 5001;
}
 
app.listen(port, function() {
  console.log("Server started succesfully");
});    