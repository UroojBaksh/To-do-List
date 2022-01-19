//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-urooj:Niblets%409008@cluster0.yqtdu.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true
});
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your To-Do list !",
});
const item2 = new Item({
  name: "Press + to add items into your list."
});
const item3 = new Item({
  name: "<-- Press this to delete an item",
});
const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items");
        }
      });
      res.redirect("/")
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});
app.get("/:customListname", function(req, res) {
  const customListname = _.capitalize(req.params.customListname);
  List.findOne({
    name: customListname
  }, function(err, foundItem) {
    if (!err) {
      if (!foundItem) {
        // Create new list
        const list = new List({
          name: customListname,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListname);
      } else {
        res.render("list", {
          listTitle: foundItem.name,
          newListItems: foundItem.items
        });
      }
    }
  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);

    })
  }
});
app.post("/delete", function(req, res) {
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedId, function(err) {
      if (!err) {
        console.log("Item Successfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, function() {
  console.log("Server has started Successfully");
});
