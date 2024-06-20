# Seadra

Seadra is a user-friendly and fully customizable annotation application that will allow you to annotate your data with a wide range of custom labels, and faster than with other annotation software.
It can also be used with a graphical tablet to make the annotation even faster and easier.

# Windows compilation as .exe
Go into the seadra-frontend folder
Run "npm run tauri:build"
Get the created seadra-frontend.exe and put it in seadra-backend/bin
Go into the seadra-backend folder
Run "pyinstaller --add-binary bin/*;bin -w seadra.py"
Take a coffee and smile

# Why you should use Seadra

<!-- Annotation time benchmark -->

# Use Seadra for your own need

## Create your own annotation set up

The available annotations can be divided into 2 categories: the annotations referring to the whole image (tag) and the annotations focusing on a part of the image (segmentation).

For the tags, there are 3 subtypes: the single-choice tag (you can select only one choice within a list), the multi-choice tag (you can select as many choices as you wish within a list), and the comment (free textual field). You can add as many tags from the first 2 subtypes as you want with lists of choices that you define manually. The comment section is unique as there is no limit to the number of characters.

For the segmentation part, you can add as many labels as you need, name them, and choose the associated color.

Here is an example of annotation set up: 

<img src="ttps://github.com/KevinCortachero/Seadra/tree/master/doc_img/setup.PNG" height="480"/>

In this example, there are 4 different labels for segmentation, 2 single-choice tags for gender and diagnosis, one multi-choice for history and a comment section.

## Get your images annotated simply and quickly

<img src="https://github.com/KevinCortachero/Seadra/tree/master/doc_img/annot_demo.PNG"/>

## Retrieve your annotations

Once saved, the annotations are stored in json files, one file for each image, named as follows: annot_{image_name}.json. You can find an example of such a file here:

<!--Add json content-->


