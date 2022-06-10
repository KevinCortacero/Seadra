
<!-- Template   -->
<template>
<div id="labelling_zone">
    <v-list-item-group>
        <v-list-item
            v-for="(label,i) in this.json.labels"
            :key="i"  class="seg_label" v-bind:style="{'background-color': label.color}"
          >
          <v-checkbox input-value="1"></v-checkbox>
          <v-list-item-title  >{{label.name}}</v-list-item-title>
        </v-list-item>
    </v-list-item-group>
    <v-combobox style="padding-top:30px" v-for="(choice,i) in this.json.customs.choices" :key="'choice'+i"
            v-model="choice_select[choice.name]"
            v-bind:items= "choice.options"
            v-bind:label="choice.name"
            outlined
            dense
          >
    </v-combobox>
    <v-combobox v-for="(check,i) in this.json.customs.checks" :key="'check'+i"
            v-model="check_select[check.name]"
            v-bind:items= "check.options"
            v-bind:label="check.name"
            multiple
            outlined
            dense
          >
    </v-combobox>
    <v-textarea v-for="(text,i) in this.json.customs.texts" :key="'text'+i" v-model=text_select[text.name] class="mx-2" v-bind:label="text.name" rows="8" prepend-icon="mdi-comment"></v-textarea>
    <v-btn @click="save_json">Sauvegarder</v-btn>
    </div>
</template>





<!-- Script   -->
<script>
import json_file from "./label.json";
    export default {
        
        data() {
            return {
                choice_select: {},
                check_select: {},
                text_select: {},
                json : json_file
            }
        
        },

        methods: {
            save_json() { // Has to know the image filename

                //let json_array = [this.choice_select, this.check_select, this.text_select]
                // for (let prop in this.choice_select) {
                //     console.log(prop)
                //     json_array.push({ prop : this.choice_select[prop] })
                // }
                // for (let prop in this.check_select) {
                //     console.log(prop)
                //     json_array.push({ prop : this.check_select[prop] })
                // }

                // for (let prop in this.text_select) {
                //     json_array.push({ prop : this.text_select[prop] })
                // } 
                //json_string = JSON.stringify(json_array)
                

            },
            beforeCreate() {
                let choices = this.json["customs"].choices
                // console.log(choices)
                for (let i=0; i<choices.length; i++) {
                    this.choice_select[choices[i].name] = ""
                    // console.log("Choice_select created")
                    // console.log(this.choice_select)
                }
                let checks = this.json["customs"].checks
                for (let i=0; i<checks.length; i++) {
                    this.check_select[checks[i].name] = ""
                    // console.log(this.check_select)
                }
                let texts = this.json["customs"].texts
                for (let i=0; i<texts.length; i++) {
                    this.text_select[texts[i].name] = ""
                    // console.log("Text_select created")
                }    
            }

        },

        mounted() {
            this.beforeCreate()
        }
    }

</script>




<!-- Style    -->
<style>



</style>