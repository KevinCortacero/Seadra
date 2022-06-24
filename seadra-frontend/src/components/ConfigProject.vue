
<!-- Template   -->
<template>

  <v-card style="height:100%;">
    <splitpanes class="customsplit" style="height:100%;">
      <pane size="30" style="overflow-y:auto; height:100%;">

        <list-files :file-path.sync="pathConfigFile" :directory.sync="projectDirectoryTmp" :file-extensions="['config.seadra']" />
      </pane>
      <pane>
        <v-card v-if="displayConfig" style="padding-top:20px;height:100%;">
<v-container>

    <v-subheader>Labels :</v-subheader>
    <v-row>
        <v-card class="d-flex flex-wrap" flat tile>
        <v-text-field v-for="(d,i) in this.data.colorsLabels" :key="'label'+i" v-model="d.name" hide-details class="ma-0 pa-2" solo outlined dense style="min-width:200px;max-width:250px" :rules="[!!d.name]">
            <template v-slot:append>
                <v-menu v-model="d.menu" top nudge-bottom="105" nudge-left="16" :close-on-content-click="false">
                    <template v-slot:activator="{ on }">
                        <div class="colorPicker" :style="{backgroundColor: d.color,borderRadius: d.menu ? '50%' : '4px'}" v-on="on" />
                    </template>
                    <v-card>
                        <v-card-text class="pa-0">
                            <v-color-picker v-model="d.color" flat />
                        </v-card-text>
                    </v-card>
                </v-menu>
                <v-btn class="mx-1" icon small color="darkgrey" @click="removeLabel(i)">
                    <v-icon>
                        mdi-close
                    </v-icon>
                    </v-btn>
            </template>
        </v-text-field>
    </v-card>
    </v-row>
    <v-row align="center" justify="center">
    <v-btn class="mx-1" fab small color="primary" @click="addLabels('')">
      <v-icon>
        mdi-plus
      </v-icon>
    </v-btn>
    </v-row>
    <v-subheader>Single Choice :</v-subheader>
<v-row v-for="(choice,i) in this.data.choices" :key="'choice'+i" dense>
    <v-col cols="3">
          <v-text-field v-model="choice.name" label="name" outlined dense :rules="[validField]"></v-text-field>
    </v-col>
    <v-col cols="8">
<v-combobox v-model="choice.options" chips clearable label="labels" multiple solo dense>
    <template v-slot:selection="{ attrs, item }">
      <v-chip v-bind="attrs" close @click:close="remove('choices',i,item)">
        <strong>{{ item }}</strong>
      </v-chip>
    </template>
  </v-combobox>
    </v-col>
 <v-col cols="1">
  <v-btn class="mx-1" fab small color="error" @click="removeField('choices',i)">
      <v-icon>
        mdi-delete
      </v-icon>
    </v-btn>
    </v-col>
</v-row>
<v-row>
    <v-row align="center" justify="center">
    <v-btn class="mx-1" fab small color="primary" @click="data.choices.push({name:'',options:[]})">
      <v-icon>
        mdi-plus
      </v-icon>
    </v-btn>
    </v-row>
</v-row>
    <v-subheader>Multi choice :</v-subheader>
<v-row v-for="(check,i) in this.data.checks" :key="'check'+i" dense >
    <v-col cols="3">
          <v-text-field v-model="check.name" label="name" outlined dense :rules="[validField]"></v-text-field>
    </v-col>
    <v-col cols="8">
<v-combobox v-model="check.options" chips clearable label="labels" multiple solo dense >
    <template v-slot:selection="{ attrs, item }">
      <v-chip v-bind="attrs" close @click:close="remove('checks',i,item)">
        <strong>{{ item }}</strong>
      </v-chip>
    </template>
  </v-combobox>
    </v-col>
 <v-col cols="1">
  <v-btn class="mx-1" fab small color="error" @click="removeField('checks',i)">
      <v-icon>
        mdi-delete
      </v-icon>
    </v-btn>
    </v-col>
</v-row>
<v-row >
    <v-row align="center" justify="center">
    <v-btn class="mx-1" fab small color="primary" @click="data.checks.push({name:'',options:[]})">
      <v-icon>
        mdi-plus
      </v-icon>
    </v-btn>
    </v-row>
</v-row>
    <v-subheader>simple input :</v-subheader>
<v-row dense style="height:55px">
<v-combobox v-model="this.data.textfield" chips clearable label="labels" multiple solo dense >
    <template v-slot:selection="{ attrs, item }">
      <v-chip v-bind="attrs" close @click:close="remove('textfield',0,item)">
        <strong>{{ item }}</strong>
      </v-chip>
    </template>
  </v-combobox>
</v-row>
    <v-row align="center" justify="center">
    <v-btn class="mx-1" color="success" @click="done">
      Done
    </v-btn>
    </v-row>
</v-container>


<!--
            <v-combobox style="margin-top:30px" v-for="(choice,i) in this.data.choices" :key="'choice'+i"
                    v-model="choice_select[choice.name]"
                    v-bind:items= "choice.options"
                    v-bind:label="choice.name"
                    outlined
                    dense
                >
            </v-combobox>
            <v-combobox v-for="(check,i) in this.data.checks" :key="'check'+i"
                    v-model="check_select[check.name]"
                    v-bind:items= "check.options"
                    v-bind:label="check.name"
                    multiple
                    outlined
                    dense
                >
            </v-combobox>
            <v-textarea v-for="(text,i) in this.data.texts" :key="'text'+i" v-model=text_select[text.name] class="mx-2" v-bind:label="text.name" v-bind:rows="text.size" prepend-icon="mdi-comment"></v-textarea>
  -->      </v-card>
        <v-card v-else style="padding:20px;height:100%;">
            <v-row>
          <v-text-field
            label="project name"
            outlined
            dense
            v-model="projectName"
          ></v-text-field>
        <v-btn color="success" @click="newProject">
          New project here
        </v-btn>
            </v-row>
        </v-card>
      </pane>
    </splitpanes>
  </v-card>
</template>





<!-- Script   -->
<script>
import ListFiles from './ListFiles.vue'
import { Splitpanes, Pane } from 'splitpanes'
import axios from 'axios'

export default {
  components: { ListFiles,
        Splitpanes, Pane, },
        
        data() {
            return {
                data:{choices:[],
                      checks:[],
                      textfield:[],
                      colorsLabels:[]},
                choice: [],
                check: [],
                text: [],
                pathConfigFile: undefined,
                projectDirectoryTmp: '/',
                projectName: '',
                displayConfig: false
            }
        },
        props:{
            projectDirectory: {type:String, default:'/'},
            configData: {type:Object},
        },
        computed:{
            configFileSelected(){
                if(this.pathConfigFile) return this.pathConfigFile.substr(0,this.pathConfigFile.lastIndexOf(this.$dirSep))===this.projectDirectoryTmp.slice(0,-1)
                return false
            }
        },
        watch:{
            projectDirectoryTmp(n){
                this.$emit('update:projectDirectory',n)
                this.displayConfig = this.configFileSelected
            },
            pathConfigFile(){
                let displayConfig = this.configFileSelected
                if(displayConfig)
                axios.post(this.$request_base_url + "/read_json",{filepath:this.pathConfigFile}, {
                    headers: {'Content-Type': 'application/json'}
                }).then(res=>{
                    this.displayConfig = displayConfig
                    if(Object.keys(res.data).length===0)
                        this.data = {choices:[],
                                    checks:[],
                                    textfield:[],
                                    colorsLabels:[]}
                    else this.data = res.data
                }).catch((error) => {
                    console.error(error);
                });
            },
        },
        methods: {
            done(){
                axios.post(this.$request_base_url + "/write_json",{filepath:this.pathConfigFile,data:this.data}, {
                    headers: {'Content-Type': 'application/json'}
                }).catch((error) => {
                    console.error(error);
                });
                this.$emit('done',this.data)
            },
            addLabels(nameLabel){
                var color=["#D94430","#009FF5", "#DEA402","#116A43","#4B1B4A"]
                this.data.colorsLabels.push({
                    color: color[this.data.colorsLabels.length%color.length],
                    menu: false,
                    name: nameLabel
                })
            },
            newProject(){
                axios.post(this.$request_base_url + "/newproject", {path:this.projectDirectoryTmp+this.projectName+this.$dirSep})
                    .then(result => {
                        this.projectDirectoryTmp = this.projectDirectoryTmp+this.projectName+this.$dirSep
                        this.pathConfigFile = result.data.configFile
                    })
            },
            remove(key,i,item){
                if(key==='textfield'){
                    this.data[key].splice(this.data[key].indexOf(item), 1)
                    this.data[key] = [...this.data[key]]
                } else {
                    this.data[key][i].options.splice(this.data[key][i].options.indexOf(item), 1)
                    this.data[key][i].options = [...this.data[key][i].options]
                }
            },
            removeField(key,i){
                this.data[key].splice(i, 1)
                this.data[key] = [...this.data[key]]
            },
            removeLabel(i){
                this.data.colorsLabels.splice(i, 1)
                this.data.colorsLabels = [...this.data.colorsLabels]
            },
            validField(name){
                var allVal = [...this.data.choices.map(v=>v.name),...this.data.checks.map(v=>v.name),...this.data.textfield,'comment']
                return !(allVal.indexOf(name) !== allVal.lastIndexOf(name))
            }
        },
        mounted() {
            this.projectDirectoryTmp=this.projectDirectory
            //this.$emit('update:getAnnotation', () => {return [this.choice_select, this.check_select, this.text_select]})
        }
    }

</script>


<style scoped>
    .colorPicker{
        cursor: pointer;
        height: 25px;
        width: 25px;
        transition: border-radius 200ms ease-in-out;
    }
</style>