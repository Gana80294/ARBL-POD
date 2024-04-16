import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseSidebarModule } from '@fuse/components';

import {
    MatFormFieldModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule
} from '@angular/material';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import {
    FuseCountdownModule,
    FuseHighlightModule,
    FuseMaterialColorPickerModule,
    FuseWidgetModule
} from '@fuse/components';

import { FuseSharedModule } from '@fuse/shared.module';
import { FormsModule } from '@angular/forms';
// import { DashboardComponent } from './dashboard/dashboard.component';
// import { InvoiceItemComponent } from './invoice-item/invoice-item.component';
import { DecimalPipe } from '@angular/common';
import { DeliveryComplianceReportComponent } from './delivery-compliance-report/delivery-compliance-report.component';
import { AttachmentDialogComponent } from './attachment-dialog/attachment-dialog.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SearchableSelectModule } from 'app/CustomControls/searchable-multi-select/searchable.module';
import { DocumentHistoryComponent } from './document-history/document-history.component';
const routes = [
    {
        path: 'delivery',
        component: DeliveryComplianceReportComponent
    },
    {
        path: 'document-history',
        component: DocumentHistoryComponent
    },
    // {
    //     path: 'invItem',
    //     component: InvoiceItemComponent
    // },
    // {
    //     path     : 'courses',
    //     component: AcademyCoursesComponent,
    //     resolve  : {
    //         academy: AcademyCoursesService
    //     }
    // },
    // {
    //     path     : 'courses/:courseId/:courseSlug',
    //     component: AcademyCourseComponent,
    //     resolve  : {
    //         academy: AcademyCourseService
    //     }
    // },
    {
        path: '**',
        redirectTo: '/auth/login'
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        // HttpClientModule,
        // TranslateModule,
        NgMultiSelectDropDownModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatStepperModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatTableModule,
        MatSortModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,

        NgxChartsModule,

        FuseSharedModule,
        FuseSidebarModule,

        FuseCountdownModule,
        FuseHighlightModule,
        FuseMaterialColorPickerModule,
        FuseWidgetModule,
        SearchableSelectModule,
        FormsModule
    ],
    declarations: [DeliveryComplianceReportComponent, DocumentHistoryComponent],
    providers: [
        DecimalPipe
    ]
})
export class ReportsModule { }
