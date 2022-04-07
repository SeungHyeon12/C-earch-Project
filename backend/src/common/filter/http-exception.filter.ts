import { Catch, HttpException, ExceptionFilter } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException) {
    const status = exception.getStatus();
    const message = exception.message;

    console.log('에러코드' + status);
    console.log('에러메세지' + message);
  }
}
