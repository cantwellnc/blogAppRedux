const express = require("express");
const expressSanitizer = require("express-sanitizer");  
const bodyParser = require("body-parser"); 
const mongoose = require("mongoose"); 
const ejs = require("ejs")
const methodOverride = require("method-override"); 
const app = express(); 

// title, image, body, created for each post

mongoose.connect('mongodb://localhost:27017/restful_blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({extended: true})); 
// must come after bodyParser
app.use(expressSanitizer());
app.use(express.static("public"));
// when you see this flag in query string, treat this as whatever _method is equal to
app.use(methodOverride("_method"));

// Schema Setup
var blogSchema = new mongoose.Schema({
	title: String, 
	image: String, 
	body: String, 
	created: {type: Date, default: Date.now}
}); 

// Model
var Blog = new mongoose.model("Blog", blogSchema); 
 
// ROUTES

// root
app.get("/", (req, res)=> {
	res.redirect("/blogs"); 
});

// Index Route
app.get("/blogs", (req,res)=> {
	Blog.find({}, (err, blogs)=> {
		if(err){
			console.log(`err: ${err}`); 
		}
		else{ 
			res.render("index", {blogs:blogs}); 
		}
	});
});

// New Route
app.get("/blogs/new", (req, res)=> {
	res.render("new"); 
});

// Create Route
app.post("/blogs", (req, res)=> {
	// sanitize blog body to get rid of script tags
	req.body.blog.body = req.sanitize(req.body.blog.body); 
	var blog = req.body.blog; 
	Blog.create(blog, (err, blogPost)=>{
		if(err){
			console.log(`err: ${err}`); 
			// show form again
			res.render("new");
		}
		else{ 
			res.redirect("/blogs");
		} 
	});	
});

// Show Route
app.get("/blogs/:id", (req, res)=> {
	// find blog with that id and render show 
	Blog.findById(req.params.id, (err, blog)=> {
		if(err){
			console.log(`err: ${err}`); 
		}
		else{ 
			res.render("show", {blog:blog}); 
		} 
	});
});

// Edit Route (Shows form)
app.get("/blogs/:id/edit", (req, res)=> {
	// find blog with that id and render show 
	Blog.findById(req.params.id, (err, blog)=> {
		if(err){
			console.log(`err: ${err}`); 
			res.redirect("/blogs");
		}
		else{ 
			res.render("edit", {blog:blog}); 
		} 
	});
});

// Update Route (takes info from Edit and sends to DB)
app.put("/blogs/:id", (req, res)=> {
	// sanitize blog body to get rid of script tags
	req.body.blog.body = req.sanitize(req.body.blog.body); 
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, blog)=> {
		if(err){
			console.log(`err: ${err}`); 
			res.redirect("/blogs");
		}
		else{ 
			res.redirect(`/blogs/${req.params.id}`); 
		} 
	});
});

// Delete Route
app.delete("/blogs/:id", (req, res)=> {
	Blog.findByIdAndRemove(req.params.id, (err)=>{
		if(err){
			console.log(`err: ${err}`);
			res.redirect("/blogs"); 
		}
		else{
			res.redirect("/blogs");
		}
	}); 
});



app.listen("3000", ()=> {
	console.log("serving on localhost:3000")
});