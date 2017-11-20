import { Component, OnInit } from '@angular/core';
import { HttpService } from '@core/services/http.service';
import { ActivatedRoute, Router, PreloadingStrategy, Params} from '@angular/router';
import { FileDownloadService } from '@core/services/fileDownload.service';

@Component({
    selector: 'app-survey-overview',
    templateUrl: './survey-overview.component.html',
    styleUrls: ['./survey-overview.component.less']
})
export class SurveyOverviewComponent implements OnInit {

    localInfo = JSON.parse(localStorage.getItem('_user'));
    loggedUser = this.localInfo.user_name;
    userGroup = this.localInfo.user_group;
    userProvince = this.localInfo.user_province;
    data = [];
    PID = '';
    constructor(
        private service: HttpService,
        private route: ActivatedRoute,
        private router: Router,
        private fileDownloader: FileDownloadService,
        ) { }

    ngOnInit() {
        // this.PID = this.route.params['value']['PID'];
        // if (this.PID && this.PID !== '') {
        //     const deleteId = { 'PID': this.PID };
        //     this.service.deleteRecord(deleteId).subscribe((res) => {
        //         console.log(res);
        //         this.router.navigate(['/detail']);
        //     });
        // }
        this.getTableData();
    }

    getTableData() {
        this.service.getPatientList().subscribe( (res) => {
            console.log(res);
            this.data = res.PID_info;
        });
    }

    deleteRecord(pid: string) {
        if (pid && pid !== '') {
            const deleteId = { 'PID': pid };
            this.service.deleteRecord(deleteId).subscribe((res) => {
                console.log('delete record work!', res);
                this.getTableData();
            });
        }
    }

    isVisible( data ): boolean {
        if (this.userGroup === '4') {
            return true;
        } else if (this.userGroup === '3' || '2') {
            return data.province === this.userProvince;
        } else if (this.userGroup === '1') {
            return data.completedBy === this.loggedUser;
        }
    }

    downloadByPID(PID) {
        this.fileDownloader.downloadFile('all.csv?PID=' + PID);
    }
    downloadAll() {
        this.fileDownloader.downloadFile('all.csv');
    }

    
}













