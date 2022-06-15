<template>
    <v-card tile style="border-radius:0px;">
        <v-card-text>
        <v-row>
            <v-btn-toggle v-model="selected_tool" mandatory color="primary">
                <v-btn :value="'fabric-move'">
                    <v-icon>mdi-drag-variant</v-icon>
                </v-btn>
                <v-btn :value="'fabric-rect'">
                    <v-icon>mdi-shape-rectangle-plus</v-icon>
                </v-btn>
                <v-btn :value="'fabric-polygon'">
                    <v-icon>mdi-vector-polygon</v-icon>
                </v-btn>
            </v-btn-toggle>
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
            </div>
        </v-row>

        <v-row>
    <v-list-item-group style="width:100%">
        <v-list-item dense
            v-for="(label,i) in this.labels"
            :key="i" 
            @click="selectedLabelIndex = i"
            class="label" v-bind:class="i==selectedLabelIndex?'active':''"
            v-bind:style="{'background-color': label.color}"
          >
          <!-- <v-checkbox input-value="1"></v-checkbox> -->
              <v-checkbox :on-icon="'mdi-eye'" :off-icon="'mdi-eye-off'"  @change="labelTool.toggleClassVisibility(i,$event)" :input-value=true color="black"></v-checkbox>
          <v-list-item-title >{{label.name}}</v-list-item-title>
        </v-list-item>
    </v-list-item-group>
        </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import LabelTool from '../js/label-tool'

    export default {
        data: () => ({ 
            selected_tool: undefined,
            labelBoxes: {},
            boxSelected: false,
            selectedLabelIndex:0
        }),
        props:{
            osd: {type:Object},
            getLabelBoxes: {type:Function},
            setLabelBoxes: {type:Function},
            labels: {type:Array},
        },
        watch: {
            // whenever question changes, this function will run
            
            selected_tool(newSlected) {
                if(this.labelTool){
                    if(newSlected==="fabric-move"){
                        this.labelTool.editModeOn();
                    } else if(newSlected==="fabric-rect"){
                        this.labelTool.drawModeOn(true)
                    } else if(newSlected==="fabric-polygon") {
                        this.labelTool.drawModeOn(false)
                    }
                }
            },
            selectedLabelIndex(){
                this.updateLabels()
            },
            osd(newOSD){
                if(!this.labelTool){
                    this.labelTool = new LabelTool()
                    this.labelTool.init(newOSD,(selectedBox)=>{
                            this.boxSelected=(selectedBox!==undefined);
                            if(selectedBox){
                                this.selectedLabelIndex =selectedBox.classID;
                            }
                        })
                    this.initEventKeyboard()
                    this.$emit('update:getLabelBoxes',()=>{return this.labelTool.saveLabelBoxes()})
                    this.$emit('update:setLabelBoxes',(data)=>{ 
                        console.log("load boxes !!!!")
                            this.loading = false;
                            this.labelTool.tempBoxData = data;
                            this.labelTool.labels = this.labels;
                            this.updateLabels()
                    })
                    window.addEventListener('resize', ()=>this.labelTool.resize());
                }
            },
            labels(){
                this.selectedLabelIndex = 0
                this.updateLabels()
            }
        },
        methods: {
            initEventKeyboard(){
                document.onkeydown = (e)=> {
                    if (e.key === 'Delete') {
                        this.labelTool.removeSelected();
                    }
                    else if (e.key === 'e') {
                        this.labelTool.drawModeOn(true);
                    }
                    else if (e.key === 'r') {
                        this.labelTool.drawModeOn(false);
                    }
                    else if (e.key === 'q') {
                        if(!this.labelTool.drawing)
                            this.labelTool.viewModeOn();
                    }
                    //disable osdviewer slide flip
                    else if(e.key === 'f') {
                        return false;
                    }
                    else if(e.key === 's') {
                        if(e.ctrlKey)
                            this.labelTool.saveLabelBoxes()
                    }
                };
            },
            updateLabels(){
                console.log(this.labels[this.selectedLabelIndex])
                this.labelTool.changeLabel(this.labels[this.selectedLabelIndex])
            },
        },
        mounted() {
        },
        unmounted() {
            window.removeEventListener('resize', this.labelTool.resize);
        },
  }
</script>


<!-- Style    -->
<style>
.label{
    height: 40px;
    margin-right: 50px;
    margin-top: 2px;
    border-radius: 0 20px 20px 0;
}
.active{
    margin-right: 10px;
}


</style>