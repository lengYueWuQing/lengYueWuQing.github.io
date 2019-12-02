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

/*trst 翻译状态  0:未翻译,1:翻译没保存,2:翻译成功*/

var tableData = [];
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
        refreshTranslate: function() {
            var filePath = this.filePath;
            filePath = filePath.trim();
            doPost("uploadFile", {
                fipa: filePath
            });
        },
        changeTranslate: function(row, index) {
            this.tableData[index].trco = row.trco;

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
                    if (datas[data].trst == 2) {
                        continue;
                    }
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
            var noneTrco = true;
            for (data in datas) {
                if (datas[data].trst == 2) {
                    continue;
                }
                var trco = datas[data].trco;
                if (trco == null) {
                    trco = "";
                }
                trco = trco.trim();
                if (trco == "") {
                    saveFlag = true;
                    continue;
                } else {
                    noneTrco = false;
                }
                results.push({
                    name: datas[data].name,
                    con: datas[data].con,
                    trco: trco
                });
            }
            if (noneTrco) {
                this.$Modal.warning({
                    title: "保存提醒",
                    content: "你还没翻译内容？",
                    closable: true,
                    onOk: function() {

                    }
                });
                return;
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
                            "datas": results
                        });
                    },
                    onCancel: function() {

                    }
                });
            } else {
                doPost("saveContent", {
                    "fipa": filePath,
                    "datas": results
                });
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
        vue.$data.tableData = [];
        vue.$data.noData = "请重新输入解析的文件路径";
    } else {
        var data = [];
        if (response != null) {
            for (var i = 0; i < response.length; i++) {
                data[i] = {
                    "name": response[i].name,
                    "con": response[i].con,
                    "trco": "",
                    "trst": 0
                };

            }

        }
        if (data.length > 0) {
            vue.$data.saveDisable = true;
            var filePath = vue.$data.filePath;
            vue.$data.fileName = filePath;
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
                        data[j].trst = 0;
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
    var datas = data.datas;
    var tableData = vue.$data.tableData;
    for (i in datas) {
        var name = datas[i].name;
        for (j in tableData) {
            if (name == tableData[j].name) {
                tableData[j].trst = 1;
            }
        }

    }
    vue.$data.tableData = tableData;
    vue.$data.load = true;
}

function saveContentResponse(response, data) {
    vue.$data.load = false;
    var tableData = vue.$data.tableData;
    if (response.ermes != null) {
        for (j in tableData) {
            if (tableData[j].trst === 1) {
                tableData[j].trst = 0;
            }
        }
        vue.$data.tableData = tableData;
        vue.$Message.error(getMessage(response));
    } else {
        for (let j in tableData) {
            if (tableData[j].trst === 1) {
                tableData[j].trst = 2;
                tableData[j]._disabled = true;
            }
        }
        vue.$data.tableData = tableData;

        vue.$Message.success("保存内容成功");
    }
}


function saveContentException(exception, data, code) {
    vue.$data.load = false;
    vue.$Message.error("请求失败，错误码：" + code);

}