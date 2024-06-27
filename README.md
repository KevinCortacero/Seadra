# Seadra

Seadra is a user-friendly and fully customizable annotation application that will allow you to annotate your data with a wide range of custom labels, and faster than with other annotation software.
It can also be used with a graphical tablet to make the annotation even faster, easier and more precise.

# .exe and compilation
You will find a Windows .exe in the [release](https://github.com/KevinCortacero/Seadra/releases/tag/v1.0) of the project. You just have to download it and run it on your computer. <br>
You can also compile your own executable by cloning this project on your computer, installing all the required dependencies, and then running the compilW10 script.<br>
Scripts for .exe generation on other OS will soon be added.


# Why you should use Seadra

Here is a benchmark we've made comparing 3 annotation methods : QuPath, Seadra without tablet and Seadra with tablet. For each method we had 10 images to annotate, which had been selected to be of equal complexity and hadn't been seen by the expert before. Here are the results :

|                | Number of features | Total time (s) | Average time by feature (s) | Average time by image (s) | Average time by feature on a case (s) | Average time of transition per case (s) |
|----------------|--------------------|----------------|-----------------------------|---------------------------|----------------------------------------|----------------------------------------|
| QuPath         | 44                 | 1050 s         | 23.86 s                     | 96.8 s                    | 22 s                                   | **8.2 s**                              |
| Seadra without tablet | 32          | **680 s**      | 21.45 s                     | **56.1 s**                | 17.53 s                                | 11.9 s                                 |
| Seadra with tablet    | **58**      | 827 s          | **13.45 s**                 | 62.5 s                    | **10.76 s**                            | 20.2 s                                 |

We can see in the table that either with or without tablet Seadra is a lot faster than QuPath. Another noticeable fact is that there are more features annotated when using the tablet. It's pretty hard to truly quantify but we have observed that the specialist tends to annotate more little features while using a tablet compared to when they use the mouse and keyboard where they would regroup these small features in a single bigger one. <br>
There is a drawback we can see in this table, which is that the time to load an image ("time of transition") is way higher when using Seadra. However, this issue has now been fixed, and some new measures need to be made but the loading time now matches QuPath.

# Use Seadra for your own need

## Create your own annotation set up

The available annotations can be divided into 2 categories: the annotations referring to the whole image (tag) and the annotations focusing on a part of the image (segmentation).

For the tags, there are 3 subtypes: the single-choice tag (you can select only one choice within a list), the multi-choice tag (you can select as many choices as you wish within a list), and the comment (free textual field). You can add as many tags from the first 2 subtypes as you want with lists of choices that you define manually. The comment section is unique as there is no limit to the number of characters.

For the segmentation part, you can add as many labels as you need, name them, and choose the associated color.

Here is an example of annotation set up: 

<img src="/doc_img/setup.PNG" height="480"/>

In this example, there are 4 different labels for segmentation, 2 single-choice tags for gender and diagnosis, one multi-choice for history, and a comment section.

## Get your images annotated simply and quickly

<img src="/doc_img/annot_demo.png" height="480"/>

## Retrieve your annotations

Once saved, the annotations are stored in json files, one file for each image, named as follows: annot_{image_name}.json. You can find an example of such a file here:

<!--Add json content-->

# Authors

This project has been developed in 2022 as a collaborative project between :
<ul>
  <li>3 interns: Jules MORATA, Clément ELOIRE, Mehdi ECH-CHOUINI</li>
  <li>a Ph.D. student: Kevin CORTACERO</li>
  <li>a postdodoctoral researcher: David Bernard</li>
</ul>

<br>

David BERNARD is taking care of maintaining the code.<br>
Jules MORATA has been doing the performance measurements and collecting the users feedbacks.

