import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
// import { Http } from '@angular/http';
import { InputcmpComponent } from '../shared/inputcmp/inputcmp.component';
import { RadiocmpComponent } from '../shared/radiocmp/radiocmp.component';
import { saveAs } from 'file-saver';
import { HttpService } from '@core/services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { CheckboxcmpComponent} from '../shared/checkboxcmp/checkboxcmp.component';
import { TablecmpComponent} from '../shared/tablecmp/tablecmp.component';
import { IdccmpComponent} from '../shared/idccmp/idccmp.component';
import { QuestionList } from '../shared/questionList';


@Component({
    selector: 'app-survey-management',
    templateUrl: './survey-management.component.html',
    styleUrls: ['./survey-management.component.css']
})



export class SurveyManagementComponent implements OnInit {
    schedule_list = [
        {
            status: '正在填写',
            descript: '一般信息'
        },
        {
            status: '等待填写',
            descript: '饮茶及咖啡情况'
        },
        {
            status: '等待填写',
            descript: '饮酒情况'
        },
        {
            status: '等待填写',
            descript: '吸烟情况'
        },
        {
            status: '等待填写',
            descript: '膳食情况'
        },
        {
            status: '等待填写',
            descript: '被动吸烟和室内空气污染'
        },
        {
            status: '等待填写',
            descript: '个人及家庭健康状况'
        },
        {
            status: '等待填写',
            descript: '体力活动情况'
        },
        {
            status: '等待填写',
            descript: '女性生育史情况'
        },
        {
            status: '等待填写',
            descript: '精神、睡眠、情绪状况及生活质量'
        }

    ];

    /**
     * 将数据转化为10个列表
     */
    questionList = new QuestionList();
    qlist = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(index => this.questionList.getQuestions(index));
    answerlist = [];
    hiddens = [false, true, true, true, true, true, true, true, true, true] ;
    confirmlist = [];
    manOrwoman = true; // ture 表示女 false 表示男
    answers = {};
    editDisable = {};

    @ViewChildren(InputcmpComponent) InputItems: QueryList<InputcmpComponent>;
    @ViewChildren(RadiocmpComponent) RadioItems: QueryList<RadiocmpComponent>;
    @ViewChildren(CheckboxcmpComponent) Checkbox: QueryList<CheckboxcmpComponent>;
    @ViewChildren(TablecmpComponent) Table: QueryList<TablecmpComponent>;
    @ViewChildren(IdccmpComponent) Idc: QueryList<TablecmpComponent>;


    current = 0;
    constructor(
        private router: Router,
        private confirmServ: NzModalService
    ) { }

    ngOnInit() {

    }

    changeHiddens(current: number) {
        for (let i = 0; i <= 9; i++) {
            if ( i === current) {
               this.hiddens[i] = false;
            }else {
                this.hiddens[i] = true;
            }
        }
    }

    pre() {
        this.current -= 1;
        // this.RadioItems.forEach(item => {
        //     item.answer.a
        //    console.log(item.answer);
        // });
        //

        this.changeHiddens(this.current);
    }
    confirm() {
        let confirms = true;
        this.confirmlist = [];
        this.InputItems.forEach(item => {
            if (item.answerChanged === false) {
                confirms = false;
                this.confirmlist.push(item.question.id);
            }
        });
        this.RadioItems.forEach(item => {
            if (item.answerChanged === false) {
                confirms = false;
                this.confirmlist.push(item.question.id);
            }
        });
        this.Checkbox.forEach(item => {
            if (item.answerChanged === false) {
                confirms = false;
                this.confirmlist.push(item.question.id);
            }
        });
        const confirmall = {
            confirms: confirms,
            confirmslist: this.confirmlist
        };
        return confirmall;

        // if (current_list[index].type === 'table') {
        //     this.Table.forEach(item => {
        //         console.log(item.getAnswer().available);
        //  });

    }

    next() {
        if (this.current === 0) {
            this.RadioItems.forEach(item => {
                if ( item.answerChanged === true)
                for (let i = 0; i < item.answer.length; i++) {
                    if (item.answer[i].questionID === 'ID1_3_0') {
                        if ( item.answer[i].answer === true ) {
                            this.manOrwoman = false;
                            break;
                        }else {
                            this.manOrwoman = true;
                        }
                    }
                }
            });
        }
        // if (this.confirm().confirms) { // 检查当前步骤是否合法，如果不合法禁止转向下一步
        //     this.current += 1;
        // }



        if (true) { // 检查当前步骤是否合法，如果不合法禁止转向下一步
            if (this.current === 7) {
                if (this.manOrwoman === false) {
                    this.current += 2;
                }else {
                    this.current += 1;
                }
            }else {
                this.current += 1;
            }
        }else {
            // let str = '';
            // for (let i = 0; i < this.confirm().confirmslist.length; i++){
            //     str = str + this.confirm().confirmslist[i] + '、';
            // }
            // this.confirmServ.error({
            //     title: '您还有以下必填项未完成：' ,
            //     content: str
            // });
        }
        this.changeHiddens(this.current);
    }


    log() {
        console.log(this.RadioItems);
        console.log(this.Checkbox);
        console.log(this.InputItems);
        //
        // this.RadioItems.forEach(item => {
        //     console.log(item.answer);
        // });
        this.router.navigate(['/survey/detail']);
    }

}
