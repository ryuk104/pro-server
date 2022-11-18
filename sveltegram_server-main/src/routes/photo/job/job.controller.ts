import { JobService } from './job.service';
import { Authenticated } from '../../decorators/authenticated.decorator';

router.use(Authenticated({ admin: true })

  router.GET()
  getAllJobsStatus(): Promise<AllJobStatusResponseDto> {
    return this.jobService.getAllJobsStatus();
  }

  router.GET('/:jobId')
  getJobStatus(@Param(ValidationPipe) params: GetJobDto): Promise<JobStatusResponseDto> {
    return this.jobService.getJobStatus(params);
  }

  router.put('/:jobId')
  async sendJobCommand(
    @Param(ValidationPipe) params: GetJobDto,
    @Body(ValidationPipe) body: JobCommandDto,
  ): Promise<number> {
    if (body.command === 'start') {
      return await this.jobService.startJob(params);
    }
    if (body.command === 'stop') {
      return await this.jobService.stopJob(params);
    }
    return 0;
  }
}
