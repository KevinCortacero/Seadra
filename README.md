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

```json
{"path": "A:\\LANGUE\\OPMD hors lichen\\LEUCOPLASIE VERRUQUEUSE PROLIF_67_SURVEILLANCE_1D.JPG",
 "boxes": [{"class": 0,
	    "type": "poly",
            "points": [{"x": 1908.0863723608445, "y": 387.4318618042228}, {"x": 1911.8176583493282, "y": 398.62571976967376}, {"x": 1915.548944337812, "y": 469.5201535508638},
                       {"x": 1915.548944337812, "y": 540.4145873320539}, {"x": 1945.3992322456816, "y": 607.5777351247604}, {"x": 1964.0556621881, "y": 678.4721689059502},
		                   {"x": 2008.831094049904, "y": 734.4414587332054}, {"x": 2068.531669865643, "y": 771.7543186180422}, {"x": 2158.0825335892514, "y": 790.4107485604608},
                       {"x": 2228.976967370442, "y": 812.7984644913629}, {"x": 2307.333973128599, "y": 820.2610364683302}, {"x": 2378.228406909789, "y": 831.4548944337814},
		                   {"x": 2449.1228406909786, "y": 850.1113243761997}, {"x": 2516.2859884836853, "y": 872.4990403071017}, {"x": 2613.299424184261, "y": 917.2744721689062},
		                   {"x": 2684.193857965451, "y": 947.1247600767756}, {"x": 2751.3570057581574, "y": 976.975047984645}, {"x": 2814.78886756238, "y": 1010.5566218809983},
		                   {"x": 2881.9520153550866, "y": 1032.9443378119004}, {"x": 2952.8464491362765, "y": 1044.1381957773513}, {"x": 3064.7850287907872, "y": 1059.063339731286},
                       {"x": 3143.1420345489446, "y": 1070.2571976967372}, {"x": 3221.499040307102, "y": 1096.3761996161231}, {"x": 3296.1247600767756, "y": 1137.4203454894434},
                       {"x": 3378.2130518234167, "y": 1174.7332053742805}, {"x": 3445.376199616123, "y": 1197.1209213051825}, {"x": 3516.270633397313, "y": 1182.195777351248},
                       {"x": 3531.1957773512477, "y": 1111.3013435700577}, {"x": 3493.8829174664106, "y": 1047.8694817658352}, {"x": 3430.451055662188, "y": 1003.094049904031},
                       {"x": 3374.481765834933, "y": 954.587332053743}, {"x": 3318.5124760076774, "y": 906.080614203455}, {"x": 3281.199616122841, "y": 846.3800383877161},
                       {"x": 3255.0806142034553, "y": 779.2168905950097}, {"x": 3195.3800383877156, "y": 715.7850287907871}, {"x": 3143.1420345489446, "y": 667.2783109404992},
                       {"x": 3105.8291746641075, "y": 600.1151631477927}, {"x": 3046.1285988483687, "y": 540.4145873320539}, {"x": 2990.1593090211136, "y": 488.1765834932823},
                       {"x": 2930.4587332053743, "y": 421.01343570057605}, {"x": 2852.1017274472165, "y": 357.5815738963533}, {"x": 2784.9385796545107, "y": 264.29942418426106},
                       {"x": 2661.806142034549, "y": 256.8368522072939}, {"x": 2579.717850287908, "y": 286.68714011516334}, {"x": 2486.4357005758156, "y": 286.68714011516334},
                       {"x": 2411.809980806142, "y": 253.1055662188101}, {"x": 2322.259117082534, "y": 245.64299424184273}, {"x": 2240.1708253358925, "y": 275.4932821497122},
                       {"x": 2165.545105566219, "y": 275.4932821497122}, {"x": 2098.3819577735126, "y": 297.8809980806143}, {"x": 2023.756238003839, "y": 335.1938579654512},
                       {"x": 1982.7120921305182, "y": 368.7754318618043}]},
	   {"class": 3, "type": "ellipse", "x": 2880.383032352971, "y": 1718.273779658149, "rx": 84.62881414660524, "ry": 134.46319532089183, "a": 72.77541330640095},
	   {"class": 2, "type": "ellipse", "x": 2268.1554702495205, "y": 1471.3704414587332, "rx": 91.51257239114602, "ry": 145.40051186858773, "a": 33.48616881551299},
	   {"class": 2, "type": "ellipse", "x": 1939.227337789735, "y": 1243.1026826667232, "rx": 86.0783352579906, "ry": 189.535004824035, "a": 110.75407131879939}],
 "annotations": {"Diagnosis": "Malignant",
		 "Gender": "Male",
		 "History": ["Alcohol", "Tobacco"],
		 "comment": "His mother also had an oral cancer"}}
```

This annotation is the one of the image displayed above, you can find the polygon, the 3 ellipsis and the different tags as well as, on top of the file, the path to the image.

# Authors

This project has been developed in 2022 as a collaborative project between :
<ul>
  <li>3 interns: Jules MORATA, Clément ELOIRE, Mehdi ECH-CHOUINI</li>
  <li>a Ph.D. student: Kevin CORTACERO</li>
  <li>a postdodoctoral researcher: David Bernard</li>
</ul>

<br>

David BERNARD is taking care of maintaining the code. <br>
Jules MORATA has been doing the performance measurements and collecting the users feedbacks.

