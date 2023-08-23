import { hasuraRequest } from 'src/boot/axios';

export class ResourceService {
  // 查询队列
  static async getQueueList() {
    const data = JSON.stringify({
      query: `query {
        queue(where: {enabled: {_eq: true}}) {
          core_number
          description
          id
          cluster {
            name
            id
          }
          memory
          name
          node_count
          scheduler_tech
          storage_capacity
        }
      }`,
    });
    const res = await hasuraRequest.post('', data);
    return res.data.queue;
  }
}
