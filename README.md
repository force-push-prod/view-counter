# View Counter
> This is a pixel image that will be updated to its number of views.

## Self-made simple view counter (using image tags)

- Hosted on a separate server
- Backend database: simple NoSQL should suffices (just 1 table: `id, time, ip, page`)
- How to use: just include a simple image tag
- The image url includes the page id
- Backend serves the image on-demand, constructing the image on the fly
- Image construction can be done using node `canvas`
- Optionally, can take additional parameters from the url and return different look for the badge

Other considerations

- Spam preventing: store ip address -- it's should be consider as personal information in this senario, see references
- Use set cookie header on the image tag to track people: not doing it. Reasons: not reliable, cna be blocked, privacy concerns, cross origin resource issues
- Is a dashboard/frontend needed? Would be nice to see some statistics, but not really required since we can always see the page view



## Refereces

- [StackExchange Law: How to satisfy GDPR's consent requirement for IP logging?](https://law.stackexchange.com/questions/28603)