import {AfterViewInit, Component, OnInit, QueryList, ViewChildren, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpService} from '@core/services/http.service';
import {NzModalService} from 'ng-zorro-antd';

import {InputcmpComponent} from '../shared/inputcmp/inputcmp.component';
import {RadiocmpComponent} from '../shared/radiocmp/radiocmp.component';

import {ScheduleList} from '../shared/scheduleList';
import {Table64Component} from '../shared/tablecmp/table64/table64.component';
import {SelectableInputComponent} from '../shared/tablecmp/selectable-input/selectable-input.component';
import {MultiRadioComponent} from '../shared/tablecmp/multi-radio/multi-radio.component';
import {SelectableTableComponent} from '../../useful-table/selectable-table/selectable-table.component';

@Component({
    selector: 'app-info6',
    templateUrl: './info6.component.html',
    styleUrls: ['./info6.component.less']
})
export class Info6Component implements OnInit, AfterViewInit {

    @ViewChildren(InputcmpComponent) InputItems: QueryList<InputcmpComponent>;
    @ViewChildren(RadiocmpComponent) RadioItems: QueryList<RadiocmpComponent>;
    @ViewChildren(Table64Component) Table64Item: QueryList<Table64Component>;
    @ViewChildren(MultiRadioComponent) MultiRadioItems: QueryList<MultiRadioComponent>;
    @ViewChildren(SelectableInputComponent) SelectableInputItems: QueryList<SelectableInputComponent>;
    @ViewChildren(SelectableTableComponent) SelectableTableItems: QueryList<SelectableTableComponent>;

    current = 6;
    questionSave = []; // 用来传到后端
    questionList = [];
    schedule_list = new ScheduleList().schedule_list; // 步骤条的list
    resultList = [];                                  // 用于封装答案
    answerList = [];
    PID = '';
    fillingList = [];                                 // 用于从后端获取答案
    putRecord = {};
    buttondisable = false;
    currentModal; // 模态框

  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private confirmServ: NzModalService,
      private service: HttpService
  ) {
      this.PID = this.route.params['value']['PID'];
      if (this.PID) {
          const getRecord = {
              'PID': this.PID
          };
          this.service.getRecord(getRecord).subscribe((res) => {
              const list = res.Records;
              console.log(res);
              this.answerList = list;
              for (let i = 0; i < list.length; i++) {
                  if (list[i]['questionlist'] && list[i]['questionlist'] !== '') {
                      this.questionList = list[i]['questionlist'][this.current];
                      this.questionSave = list[i]['questionlist'];
                      break;
                  }
              }
              this.fillingAllanswer();
          });
      }
  }

  ngOnInit() {
      // this.questionList = this.questionSave[this.current];
  }

    ngAfterViewInit() {
        if (this.PID) {
            this.fillingAllanswer();
        }
    }
    onVoted (showAndhidden: any) {
        for ( let i = 0; i <  showAndhidden.hiddenshowlist.length; i++) {
            for ( let j = 0; j < this.questionList.length; j++) {
                if ( this.questionList[j].id1 === showAndhidden.hiddenshowlist[i] ) {
                    this.questionList[j]['hidden'] = false;
                }
            }
        }
        for (let i = 0; i < showAndhidden.hiddenlist.length; i++) {
            for ( let j = 0; j < this.questionList.length; j++) {
                if ( this.questionList[j].id1 === showAndhidden.hiddenlist[i] ) {
                    this.questionList[j]['hidden'] = true;
                }
            }
        }
    }

    /** 下一步 **/
    next(step_index? : any) {
        const numWords = ['info0', 'info1', 'info2', 'info3', 'info4', 'info5', 'info6', 'info7', 'info8'];
        this.initPutRecord();
        this.service.putRecord(this.putRecord).subscribe( (res) => {
            this.router.navigate(['system/survey/' + numWords[step_index] + '/' + this.PID]);  // 拼接跳转链接
        });
    }

    temporary_deposit() {
        this.initPutRecord();
        console.log(this.putRecord);
        this.service.putRecord(this.putRecord).subscribe((res) => {
            this.router.navigate(['system/survey/detail/']);
        }, error => {
        });
    }
    exit () {
        this.router.navigate( ['system/survey/detail/']);
    }
    pre() {
        this.initPutRecord();
        this.service.putRecord(this.putRecord).subscribe((res) => {
        }, error => {
        });
        this.router.navigate(['system/survey/info5/' + this.PID]);
        console.log(this.putRecord);
    }
    initPutRecord() {
        this.collecAllanswer();
        if (this.PID) {
            this.putRecord = { 'Records': this.resultList, 'PID': this.PID };
        }else {
            this.putRecord = { 'Records': this.resultList };
        }
    }

    /**
     *  页面跳转，弹窗检验是否填完，若选择确定则继续跳转，否则留在当前页面
     */
    jumpTo(step_index , footer) {
        const numWords = ['info0', 'info1', 'info2', 'info3', 'info4', 'info5', 'info6', 'info7', 'info8'];
        if (this.PID && step_index !== this.current) { // 如果有病人编号，则跳跃
            if (this.buttondisable === true) {
                this.router.navigate(['system/survey/' + numWords[step_index] + '/' + this.PID]);  // 拼接跳转链接
            } else {
                if (this.confirm().confirms) {
                    this.next(step_index);
                }else {
                    console.log(this.confirm());
                    let rest = '（本页剩余：' + (this.confirm().confirmP*100).toFixed(3) + '%）';
                    let str = '';
                    for ( let i = 0; i < this.confirm().confirmList.length; i++) {
                        str = str + this.confirm().confirmList[i] + '、';
                    }
                    this.currentModal = this.confirmServ.open({
                        title: '您还有以下必填项没有完成' + rest ,
                        content: str,
                        footer: footer,
                        onOk() {
                            console.log('Click ok');
                        },
                        onCancel() {
                            console.log('Click cancel');
                        }
                    });
                }
            }
        }
    }

    /**
     * 取消跳转
     */
    handleCancel() {
        this.currentModal.destroy('onCancel');
    }

    /**
     * 选择确定，则跳转到指定页面
     * @param step_index
     */
    handleOk(step_index) {
        console.log("step_index");
        /* destroy方法可以传入onOk或者onCancel。默认是onCancel */
        this.currentModal.destroy('onOk');
        this.currentModal = null;
        this.next(step_index);
    }

    confirm() {
        const confirmlist = [];
        let confirmnum = 0;
        let confirms = true;
        this.InputItems.forEach(item => {
            confirmnum ++;
            if (item.question.hidden === false && item.answerChanged === false) {
            confirms = false;
            confirmlist.push(item.question.id1);
        }});
        this.RadioItems.forEach(item => {
            confirmnum ++;
            if (item.question.hidden === false && item.answerChanged === false) {
            confirms = false;
            confirmlist.push(item.question.id1);
        }});
        this.SelectableInputItems.forEach(item => {
            item.getAnswer();
            confirmnum ++;
            if (item.question.hidden === false && item.answerChanged === false) {
            confirms = false;
            confirmlist.push(item.question.id1);
        }});
        this.MultiRadioItems.forEach(item => {
            item.getAnswer();
            confirmnum ++;
            if (item.question.hidden === false && item.answerChanged === false) {
            confirms = false;
            confirmlist.push(item.question.id1);
        }});
        this.SelectableTableItems.forEach(item => {
            item.getAnswer();
            confirmnum ++;
            if (item.question.hidden === false && item.answerChanged === false) {
                confirms = false;
                confirmlist.push(item.question.id1);
            }});
        this.Table64Item.forEach(item => {
            item.getAnswer();
            confirmnum ++;
            if (item.question.hidden === false && item.answerChanged === false) {
            confirms = false;
            confirmlist.push(item.question.id1);
        }});
        const confirmAll = {
            confirms: confirms,
            confirmList: confirmlist,
            confirmP: confirmlist.length/confirmnum
        };
        return confirmAll;
    }
    collecAllanswer() {
        this.RadioItems.forEach(item => {
            if (item.answerChanged === true) {
                for (let i = 0; i < item.answer.length; i++) {
                    this.resultList.push(item.answer[i]);
                }
            }
        });
        this.InputItems.forEach(item => {
            if (item.answerChanged === true) {
                console.log( item.answer );
                for (let i = 0; i < item.answer.length; i++) {
                    this.resultList.push(item.answer[i]);
                }
            }
        });
        this.Table64Item.forEach(item => {
            item.getAnswer();
            item.changedAnswer.forEach(d => {
                this.resultList.push(d);
            });
        });
        this.SelectableInputItems.forEach(item => {
            if (item.answer) {
                for (let i = 0; i < item.answer.length; i++) {
                    this.resultList.push(item.answer[i]);
                }
            }
        });
        this.MultiRadioItems.forEach(item => {
            if (item.answer) {
                for (let i = 0; i < item.answer.length; i++) {
                    this.resultList.push(item.answer[i]);
                }
            }
        });
        this.SelectableTableItems.forEach(item => {
            item.getAnswer();
            item.changedAnswer.forEach(d => {
                this.resultList.push(d);
            });
        });
        this.questionSave[this.current] = this.questionList;
        this.resultList.push(
            {'Record_ID': 'questionlist', 'Record_Value': this.questionSave}
        );
        for (let i = 0; i < this.answerList.length; i++) {
            for (let j = 0; j < this.resultList.length; j++) {
                const id = this.resultList[j].Record_ID;
                if (this.answerList[i][id] || this.answerList[i][id] === 0) {
                    this.resultList[j]['Updated_time'] = this.answerList[i]['Updated_time'];
                }
            }
        }
        console.log(this.resultList);
    }

    fillingAllanswer() {

        const getRecord = {
            'PID': this.PID
        };
        this.service.getRecord(getRecord).subscribe(
            (res) => {
                this.fillingList = res.Records;
                const pageSix = [];
                this.fillingList.forEach(d => {
                    for (const key in d) {
                        if (key.substr(0, 1) === 'g') {
                            pageSix.push(d);
                        }
                    }
                });

                if (this.fillingList && this.fillingList.length !== 0) {
                    this.InputItems.forEach(item => {
                        pageSix.forEach(fl => {
                            const id = item.question.id2;
                            if (fl[id] && fl[id] !== '') {
                                item.localAnswer = fl[id];
                            }
                            if (fl[id] === 0) {
                                item.localAnswer = '0';
                            }
                        });
                    });
                }

                this.RadioItems.forEach(item => {
                    pageSix.forEach(fl => {
                        const id = item.question.id2;
                        if (fl[id] && fl[id] !== '') {
                            item.localAnswer = fl[id] - 1;
                        }
                    });
                });

                this.MultiRadioItems.forEach(item => {
                    // console.log(item);
                    pageSix.forEach(fl => {
                        const id = item.question.id2;
                        for (let i = 0 ; i < id.length; i++) {
                            if (fl[id[i]] && fl[id[i]] !== '') {
                                item.localAnswer[i] = parseInt(fl[id[i]]);
                            }
                        }
                    });
                });

                this.SelectableInputItems.forEach(item => {
                    pageSix.forEach(fl => {
                        const id = item.question.id2;
                        for (let i = 0; i < id.length; i++) {
                            if (fl[id[i]] && fl[id[i]] !== '') {
                                item.localAnswer[i] = fl[id[i]];
                            }
                        }
                    });
                });

                this.Table64Item.forEach(item => {
                    // console.log(item);
                    const id = item.idArray;
                    pageSix.forEach(d => {
                        for (let j = 0; j < item.initialArray.length; j++) {
                            if (d[id[j]] && d[id[j]] !== '') {
                                // if (j === 2 || (27 < j && j < 43)) {
                                if (j === 0 || j === 2 || (27 < j && j < 43)) {
                                    item.initialArray[j] =parseInt(d[id[j]]);
                                }else {
                                    item.initialArray[j] = d[id[j]];
                                }
                            }
                        }
                    });
                });
                this.SelectableTableItems.forEach(item => {
                    const id = item.idArray;
                    // console.log(id);
                    pageSix.forEach(d => {
                        for (let i = 0; i < item.row; i++) {
                            for (let j = 0; j < item.column + 1; j++) {
                                if (d[id[i][j]] && d[id[i][j]] !== '') {
                                    item.initialArray[i][j] = d[id[i][j]];
                                    if (item.initialArray[i][j] === '1' || item.initialArray[i][j] === '2') {
                                        item.initialArray[i][j] = parseInt(item.initialArray[i][j]);
                                    }
                                }
                            }
                        }
                    });
                });

            }, error => {
                console.log(error);
            }
        );
    }
}
