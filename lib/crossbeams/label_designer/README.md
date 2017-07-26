# README #

This is the property of J&J Multi-Tier (Pty) Ltd.

### What is this repository for? ###

The purpose of this project is to collect variable fields and configurations of labels from the clients in a visual way.
By allowing our clients to indicate where on an existing designed label template they want the variables to be printed
as well as what font, font size etc. we can generate images to send to the printer to speed up the printing process.

This process needs to be improved as the printers we have at our disposal do not accomodate for foreign fonts such as
Russian or Chinese for example. At the moment we are using ZPL files to get our labels printed, but image combinations
will allow us any fonts as well as speed up the printing process as the printer no longer needs to process the zpl files.

### How do I get set up? ###

This is a simple html file with no framework

### Who do I talk to? ###

* Elizabeth Hendriks: heilahendriks1@gmail.com
* James Silberbauer jamessil@telkomsa.net
* Hans Zietsman: hansjuriezietsman@gmail.com
* Dr. Johan Fourie: Johan.Fourie.jmt@gmail.com

### Dependencies: ###

#### Stylesheet: ####

* "http://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css"

#### Javascripts: ####

* "jquery-3.1.1.min.js"
* "jquery-ui-1.12.1.min.js"
* "konva.min.js"
* "font-awesome-cdn-config.js"


#### Label Designer Usage Tips: ####

* Add variables first, they don't have to be exact as you can always move and resize them later to be exact.
* When variable rotation is prevented by overlap, make it smaller first, rotate and then resize it again to fit the space.
