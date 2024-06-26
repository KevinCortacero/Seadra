<template>
    <v-card tile style="border-radius:0px;overflow-x:hidden">
        <v-card-text>
        <v-row>
            <v-btn-toggle v-model="selected_tool" color="primary" class="flex-wrap" style="height: auto;" variant="outlined" divided>
                <v-btn style="height: 48px" value="fabric-view" icon="mdi-drag-variant" tile></v-btn>
                <v-btn style="height: 48px" value="fabric-edit" icon="mdi-cursor-pointer" tile></v-btn>
                <v-btn style="height: 48px" value="fabric-rect" icon="mdi-shape-rectangle-plus" tile></v-btn>
                <v-btn style="height: 48px" value="fabric-ellipse" icon="mdi-shape-circle-plus" tile></v-btn>
                <v-btn style="height: 48px" value="fabric-polygon" icon="mdi-vector-polygon" tile></v-btn>
                <v-btn style="height: 48px" value="no" v-show="boxSelected" @click="labelTool.removeSelected()" icon="mdi-delete" tile></v-btn>
                <v-btn style="height: 48px" value="no" v-show="boxSelected" @click="labelTool.bringToFront()" icon="mdi-arrange-bring-forward" tile></v-btn>
                <v-btn style="height: 48px" value="no" v-show="boxSelected" @click="labelTool.sendToBack()" icon="mdi-arrange-send-backward" tile></v-btn>
            </v-btn-toggle><!--
            <div class="v-item-group v-btn-toggle primary--text" :class="$vuetify.theme.dark?'theme--dark':'theme--light'">
                <v-btn v-if="boxSelected" @click="labelTool.removeSelected()">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn v-if="boxSelected" @click="labelTool.bringToFront()">
                    <v-icon>mdi-arrange-bring-forward</v-icon>
                </v-btn>
                <v-btn v-if="boxSelected" @click="labelTool.sendToBack()">
                    <v-icon>mdi-arrange-send-backward</v-icon>
                </v-btn>
            </div>-->
        </v-row>

        <v-row>
    <v-list style="width:100%">
        <v-list-item dense
            v-for="(label,i) in this.labelsAnnot"
            :key="i" 
            @click="(e)=>changeLabelIndex(i,e)"
            class="label" v-bind:class="i==selectedLabelIndex?'active':''"
            v-bind:style="{'background-color': label.color}"
          >
          <!-- <v-checkbox input-value="1"></v-checkbox> -->
        <template v-slot:prepend>
              <v-checkbox density="compact" :hide-details='true' true-icon="mdi-eye-off" false-icon="mdi-eye" @click.stop.capture="" @change="labelTool.toggleClassVisibility('label',(b)=>b.classID===i,!$event.target.checked)" color="#333"></v-checkbox>
        </template>
            <v-list-item-title v-text="label.name"></v-list-item-title>
           <template v-slot:append>
          <v-badge bordered :content="label.count.toString()" inline color="primary" class="count">
          </v-badge>
        </template>
        </v-list-item>
    </v-list>
        </v-row>
        </v-card-text>
    </v-card>
</template>

<script>

    export default {
        data: () => ({ 
            selected_tool: undefined,
            labelBoxes: {},
            boxSelected: false,
            listenChange: true,
            selectedLabelIndex:0,
            labelsAnnot: [],
        }),
        props:{
            osd: {type:Object},
            getLabelBoxes: {type:Function},
            setLabelBoxes: {type:Function},
            labels: {type:Array},
            stateSave: {type:Boolean},
            labelTool: {type:Object}
        },
        watch: {
            // whenever question changes, this function will run
            
            selected_tool(newSlected,oldV) {
                if(this.labelTool){
                    if(newSlected==="no"){
                        setTimeout(() => this.selected_tool = oldV,1)
                    } else if(newSlected==="fabric-view"){
                        this.labelTool.viewModeOn();
                    } else if(newSlected==="fabric-edit"){
                        this.labelTool.editModeOn();
                    } else if(newSlected==="fabric-rect"){
                        this.setToCurrentTheme()
                        this.labelTool.drawModeOn('rect')
                    } else if(newSlected==="fabric-polygon") {
                        this.setToCurrentTheme()
                        this.labelTool.drawModeOn('poly')
                    } else if(newSlected==="fabric-ellipse") {
                        this.setToCurrentTheme()
                        this.labelTool.drawModeOn('ellipse')
                    }
                }
            },
            selectedLabelIndex(){
                if(this.selectedLabelIndex>=0&&this.selectedLabelIndex<this.labelsAnnot.length)
                    this.setToCurrentTheme()
            },
            labels(){
                this.selectedLabelIndex = 0
                this.labelsAnnot = this.labels.map((l)=>{return{...l,count:0}})
            },
            labelTool(){
                this.labelTool.on('change.category',cat=>{
                    if(cat!=='label'){
                        this.selectedLabelIndex=-1
                        this.selected_tool = undefined
                    }
                })
                this.labelTool.on('change.theme.label',b=>{
                    this.selectedLabelIndex = b.classID
                    this.labelsAnnot.forEach(l=>l.count=0)
                    this.labelTool.getBox('label').forEach(l=>this.labelsAnnot[l.classID].count+=1)
                })
                this.labelTool.on('created.label',b=>{
                    this.labelsAnnot[b.classID].count+=1
                    if(this.listenChange) this.$emit('update:stateSave',true)
                })
                this.labelTool.on('removed.label',b=>{
                    this.labelsAnnot[b.classID].count-=1
                    if(this.listenChange) this.$emit('update:stateSave',true)
                })
                this.labelTool.on('select.label',b=>{
                    this.selectedLabelIndex = b.classID;
                })
                this.labelTool.on('select',cat=>{
                    this.boxSelected = true;
                })
                this.labelTool.on('unselect',cat=>{
                    this.boxSelected = false;
                })
                this.labelTool.on('updated.label',cat=>{
                    if(this.listenChange) this.$emit('update:stateSave',true)
                })
                this.labelTool.on('loading.end',cat=>{
                    this.listenChange = true
                    this.$emit('update:stateSave',false)
                })
            },
        },
        methods: {
            setToCurrentTheme(){
                if(this.selectedLabelIndex>=0&&this.selectedLabelIndex<this.labelsAnnot.length)
                    this.labelTool.setTheme('label',{color:this.labelsAnnot[this.selectedLabelIndex].color,classID:this.selectedLabelIndex})
                else this.selectedLabelIndex = 0
            },
            changeLabelIndex(i,e){
                if(!e.target.classList.contains("v-input--selection-controls__ripple")) //TODO: burk
                    this.selectedLabelIndex = i
            },
            updateBoxes(data){
                this.listenChange = false
                this.labelTool.removeAllBoxes('label');
                this.labelTool.loadLabelBoxes(data,(b)=>{
                    return {color:this.labelsAnnot[b.class]?.color||'#000',
                            cat:'label',
                            classID:b.class
                           }
                })
            },
            getJson(){
                return this.labelTool.saveLabelBoxes('label',b=>({class:b.classID}))
            }
        }
  }
</script>


<!-- Style    -->
<style scoped>
.label{
    height: 40px;
    margin-right: 50px;
    margin-top: 2px;
    border-radius: 0 30px 30px 0;
}
.active{
    margin-right: 10px;
}
.count{
    position: absolute;
    right: -10px;
    top: -2px;
}


</style>