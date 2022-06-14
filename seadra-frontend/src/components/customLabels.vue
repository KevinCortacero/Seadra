
<!-- Template   -->
<template>
  <v-card>
    <v-combobox style="margin-top:30px" v-for="(choice,i) in this.choices" :key="'choice'+i"
            v-model="choice_select[choice.name]"
            v-bind:items= "choice.options"
            v-bind:label="choice.name"
            outlined
            dense
          >
    </v-combobox>
    <v-combobox v-for="(check,i) in this.checks" :key="'check'+i"
            v-model="check_select[check.name]"
            v-bind:items= "check.options"
            v-bind:label="check.name"
            multiple
            outlined
            dense
          >
    </v-combobox>
    <v-textarea v-for="(text,i) in this.texts" :key="'text'+i" v-model=text_select[text.name] class="mx-2" v-bind:label="text.name" v-bind:rows="text.size" prepend-icon="mdi-comment"></v-textarea>
    <v-row align="center" justify="space-around">
        <v-btn @click="save_json">Sauvegarder</v-btn>
  </v-row>
  </v-card>
</template>





<!-- Script   -->
<script>
import axios from 'axios'
import json_file from "./label.json";

    export default {
        
        data() {
            return {
                choice_select: {},
                check_select: {},
                text_select: {},
                choices: [],
                checks: [],
                texts: [],
            }
        },
        computed:{
            labelsVisibility:{
                get () {
                return this.$store.state.labelsVisibility
                },
                set (value) {
                this.$store.commit('UPDATE_LABELS_VISIBILITY', value)
                }
            }
        },
        watch:{

        },
        methods: {
            save_json() { // Has to know the image filename

                let json_array = [{"path" : this.$store.state.filepath},this.$store.state.getBoxLabels(),this.choice_select, this.check_select, this.text_select]
                let json_string = JSON.stringify(json_array)
                console.log(json_string)

                axios.post(this.$request_base_url + "/write_json",json_string, {
                    headers: {'Content-Type': 'application/json'}
                }).catch((error) => {
                    console.error(error);
                });

            },
            load_json(){
                this.choices = json_file.customs.choices;
                this.checks = json_file.customs.checks;
                this.texts = json_file.customs.texts;
                this.labels = json_file.labels;
                this.$store.commit('UPDATE_LIST_LABEL',this.labels.map((l,i)=>{l.id=i;return l}));
                this.$store.commit('CHANGE_SELECTED_LABEL',0);
            },
            selectLabel(index){
                this.$store.commit('CHANGE_SELECTED_LABEL',index);
            }
        },

        created() {
            this.load_json()
            
            // console.log(choices)
            for (let i=0; i<this.choices.length; i++) {
                this.choice_select[this.choices[i].name] = ""
                // console.log("Choice_select created")
                // console.log(this.choice_select)
            }
            for (let i=0; i<this.checks.length; i++) {
                this.check_select[this.checks[i].name] = ""
                // console.log(this.check_select)
            }
            for (let i=0; i<this.texts.length; i++) {
                this.text_select[this.texts[i].name] = ""
                // console.log("Text_select created")
            }    
        }
    }

</script>



