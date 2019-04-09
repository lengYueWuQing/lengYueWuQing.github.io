var tableColumns = [{
    type: 'selection',
    width: 60,
    align: 'center'
}, {
    title: "name",
    key: "name"

}, {
    title: "原内容",
    key: "con"

}, {
    title: "翻译内容",
    slot: "trco"
}];

var tableData = [{
    name: "hahah",
    con: "ksksskkskskssksksksk",
    trco: "dwdds555x"
}, {
    name: "hahah1",
    con: "ksksskkskskssksksksk1",
    trco: "dwdds555x1"
}];
var vue = new Vue({
    el: "#main",
    data: {
        filePath: "",
        fileName: "",
        load: false,
        noData: "请先输入解析的文件路径",
        tableData: tableData,
        tableColumns: tableColumns,
        selection: [],
        saveDisable: false
    },
    methods: {
        search: function() {
            var filePath = this.filePath;
            filePath = filePath.trim();
            if (filePath == "") {
                this.$Message.error("输入文件不能为空");
            } else if (filePath.endsWith(".xml")) {
                doPost("uploadFile", {
                    fipa: filePath
                });

            } else {
                this.$Message.error('输入文件有误，不是xml文件');
            }


        },
        cancelAnaly: function() {
            this.fileName = "";
            this.filePath = "";
            this.saveDisable = false;
            this.selection = [];
            this.noData = "请先输入解析的文件路径";
            this.tableData = "";

        },
        selectChange: function(selection) {
            this.selection = selection;
            console.info(selection);

        },
        translate: function() {
            var datas = this.selection;
            if (datas.length > 0) {
                var results = [];
                for (data in datas) {
                    var trco = datas[data].trco;
                    if (trco == null) {
                        trco = "";
                    }
                    trco = trco.trim();
                    results.push({
                        name: datas[data].name,
                        con: datas[data].con,
                        trco: trco
                    });
                }
                doPost("translate", results);

            } else {
                this.$Message.error('请选择翻译内容');
            }

        },
        saveContent: function() {
            var datas = this.tableData;
            var results = [];
            var saveFlag = false;
            for (data in datas) {
                var trco = datas[data].trco;
                if (trco == null) {
                    trco = "";
                }
                trco = trco.trim();
                if (trco == "") {
                    saveFlag = true;
                }
                results.push({
                    name: datas[data].name,
                    con: datas[data].con,
                    trco: trco
                });
            }
            var filePath = vue.$data.filePath;
            if (saveFlag) {
                this.$Modal.confirm({
                    title: "保存提醒",
                    content: "还有文件没翻译,确定现在保存吗？",
                    closable: true,
                    onOk: function() {
                        doPost("saveContent", {
                        	"fipa": filePath,
                        "datas":results});
                    },
                    onCancel: function(){
                    	
                    }
                });
            } else {
                doPost("saveContent", {
                        	"fipa": filePath,
                        "datas":results});
            }


        }

    }
});



function uploadFileRequest(request, data) {
    vue.$data.load = true;

}

function uploadFileResponse(response, data) {
    vue.$data.load = false;
    if (response.ermes != null) {
        vue.$Message.error(getMessage(response));
        vue.$data.tableData=[];
        vue.$data.noData = "请重新输入解析的文件路径";
    } else {
        var data = [];
        if (response != null) {
            for (var i = 0; i < response.length; i++) {
                data[i] = {
                    "name": response[i].name,
                    "con": response[i].con,
                    "trco": ""
                };

            }

        }
        if (data.length > 0) {
            vue.$data.saveDisable = true;
            var filePath = vue.$data.filePath;
            vue.$data.fileName = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.lastIndexOf("."));
        } else {
            vue.$data.noData = "未获取到需要翻译内容";
        }
        vue.$data.tableData = data;
    }


}

function uploadFileException(exception, data, code) {
    vue.$data.load = false;
    vue.$Message.error("请求失败，错误码：" + code);

}




function translateRequest(request, data) {
    vue.$data.load = true;
}

function translateResponse(response, data) {
    vue.$data.load = false;
    if (response.ermes != null) {
        vue.$Message.error(getMessage(response));
    } else {
        var data = vue.$data.tableData;
        if (response != null) {
            for (var i = 0; i < response.length; i++) {
                for (var j = 0; j < data.length; j++) {
                    if (response[i].name === data[j].name) {
                        data[j].con = response[i].con;
                        data[j].trco = response[i].trco;
                    }

                }
            }

        }
        vue.$data.tableData = data;
    }

}

function translateException(exception, data, code) {
    vue.$data.load = false;
    vue.$Message.error("请求失败，错误码：" + code);

}




function saveContentRequest(request, data) {
    vue.$data.load = true;
}

function saveContentResponse(response, data) {
    vue.$data.load = false;
    if (response.ermes != null) {
        vue.$Message.error(getMessage(response));
    } else {
        vue.$Message.success("保存内容成功");
    }
}


function saveContentException(exception, data, code) {
    vue.$data.load = false;
    vue.$Message.error("请求失败，错误码：" + code);

}