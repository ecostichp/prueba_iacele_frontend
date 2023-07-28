import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

export default function PowerBI () {

    return (
        <PowerBIEmbed
            embedConfig = {{
                type: 'report',   // Supported types: report, dashboard, tile, visual, qna, paginated report and create
                id: 'd4ac67c1-11fd-4db7-a512-3c14c196dab4',
                embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=d4ac67c1-11fd-4db7-a512-3c14c196dab4&groupId=71883fb3-a5d6-4027-be35-0090c1f643d1&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVNPVVRILUNFTlRSQUwtVVMtQy1QUklNQVJZLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0IiwiZW1iZWRGZWF0dXJlcyI6eyJtb2Rlcm5FbWJlZCI6dHJ1ZSwidXNhZ2VNZXRyaWNzVk5leHQiOnRydWV9fQ%3d%3d',
                accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvM2M0YmNmNmEtNDM5NC00MjU4LTliNWQtZmUyZmQxODgwYWNiLyIsImlhdCI6MTY5MDU3ODI2NiwibmJmIjoxNjkwNTc4MjY2LCJleHAiOjE2OTA1ODM3NDQsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJBVFFBeS84VUFBQUFscXBTVWQrTTlVVFNnVVpNTEhaajN2RFZpdE44OUVmb0tjREFxMmNjMzFGZC8vNmdMV2hJVW0vSUoxcFRIWGxNIiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6Ijg3MWMwMTBmLTVlNjEtNGZiMS04M2FjLTk4NjEwYTdlOTExMCIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiaWFDZWxlIiwiZ2l2ZW5fbmFtZSI6IkFkbWluaXN0cmFkb3IiLCJpcGFkZHIiOiIxODcuMTk5Ljk3LjE3MyIsIm5hbWUiOiJBZG1pbmlzdHJhZG9yIGlhQ2VsZSIsIm9pZCI6Ijg3NTlmNTdhLTM2MzktNDIwNi1hMzIzLTRkZDgwZGE4OGFlMyIsInB1aWQiOiIxMDAzMjAwMkNBQkZDMDlFIiwicmgiOiIwLkFiMEFhczlMUEpSRFdFS2JYZjR2MFlnS3l3a0FBQUFBQUFBQXdBQUFBQUFBQUFDOUFDUS4iLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJLazJIaTY5c2J4Umhlc1B2RFVraDgtVHdSbVQ4UjdmbE15TGtQbjhvZm5FIiwidGlkIjoiM2M0YmNmNmEtNDM5NC00MjU4LTliNWQtZmUyZmQxODgwYWNiIiwidW5pcXVlX25hbWUiOiJhZG1pbkBpYWNlbGUuY29tIiwidXBuIjoiYWRtaW5AaWFjZWxlLmNvbSIsInV0aSI6InY4YVVBN3RpdVUtSllPMDd2TDhMQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbIjYyZTkwMzk0LTY5ZjUtNDIzNy05MTkwLTAxMjE3NzE0NWUxMCIsImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfcGwiOiJlcy1NWCJ9.sLF0dfw7ooDEX1-QO9VHLbnHPsZVk09hwpTA8Jsq_0v6ohTc6NSkVjCIwS82peSfkK_ikBSoeJHW8KPhtKxlvJdcYJ6HLx6gNr1PUPmmCmgvrEU3eu04emkkvey7BvbJGd0YfazKx_cgSVhJEbw4wpjbFecsmm4gdDS46JfBJZf-ufz5HmCshNkaYihhXm6GNedLFz3C2Qt7S30Q7v98_gYT3t3EY8R9ujKEPMActJM2fPRQ4FTjUVzPn0KdEgxkYkqU7Pwp6ENzXpJwrwEfL2_Qv-Njf9cyZmWDNbqYhDUI_6IsOt-CmEu2dQzXjbsZVvUYF1cQKIKSIgy49EBwKg',
                tokenType: models.TokenType.Aad, // Use models.TokenType.Aad for SaaS embed
                settings: {
                    panes: {
                        filters: {
                            expanded: false,
                            visible: false
                        }
                    },
                    background: models.BackgroundType.Transparent,
                }
            }}

            eventHandlers = {
                new Map([
                    ['loaded', function () {console.log('Report loaded');}],
                    ['rendered', function () {console.log('Report rendered');}],
                    ['error', function (event) {console.log(event.detail);}],
                    ['visualClicked', () => console.log('visual clicked')],
                    ['pageChanged', (event) => console.log(event)],
                ])
            }

            cssClassName = { "PowerBIFrame" }

            getEmbeddedComponent = { (embeddedReport) => {
                window.report = embeddedReport;
            }}
    />
    )
}